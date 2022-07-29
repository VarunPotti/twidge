// CREDITS: https://github.com/spacedriveapp/spacedrive/blob/c685ce5fe995a51b5a8&ab9e943f8c2f92ab69f50/core/src/util/db.rs

use data_encoding::HEXLOWER;
use include_dir::{include_dir, Dir};
use prisma::{self, migration, PrismaClient};
use prisma_client_rust::{raw, NewClientError};
use ring::digest::{Context, SHA256};
use thiserror::Error;

const INIT_MIGRATION: &str =
    include_str!("../../prisma/prisma/migrations/migration_table/migration.sql");
static MIGRATIONS_DIR: Dir = include_dir!("$CARGO_MANIFEST_DIR/prisma/prisma/migrations");

/// migration error represents an error that occurred while initalising/migrating the database
#[derive(Error, Debug)]
pub enum MigrationError {
    #[error("An error occurred while initialising a new database connection")]
    DatabaseIntialisation(#[from] NewClientError),
    #[error("An error occurred with the database while applying migrations")]
    DatabaseError(#[from] prisma_client_rust::queries::Error),
    #[error("An error occured reading the embedded migration files. {0}. Please report to Spacedrive developers!")]
    InvalidEmbeddedMigration(&'static str),
}

pub async fn new_client(db_url: &str) -> Result<PrismaClient, MigrationError> {
    // initialise a new prisma client
    let client = prisma::new_client_with_url(&format!("file://{}", db_url)).await?;

    let migrations_table_missing = client
        ._query_raw::<serde_json::Value>(raw!(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='_migrations'"
        ))
        .await?
        .len()
        == 0;

    // the _migrations table is missing, so we need to create it
    if migrations_table_missing {
        client._execute_raw(raw!(INIT_MIGRATION)).await?;
    }

    let mut migration_directories = MIGRATIONS_DIR
        .dirs()
        .map(|dir| {
            dir.path()
                .file_name()
                .ok_or(MigrationError::InvalidEmbeddedMigration(
                    "File has malformed name",
                ))
                .and_then(|name| {
                    name.to_str()
                        .ok_or_else(|| {
                            MigrationError::InvalidEmbeddedMigration(
                                "File name contains malformed characters",
                            )
                        })
                        .map(|name| (name, dir))
                })
        })
        .filter_map(|v| match v {
            Ok((name, _)) if name == "migration_table" => None,
            Ok((name, dir)) => match name[..14].parse::<i64>() {
                Ok(timestamp) => Some(Ok((name, timestamp, dir))),
                Err(_) => Some(Err(MigrationError::InvalidEmbeddedMigration(
                    "File name is incorrectly formatted",
                ))),
            },
            Err(v) => Some(Err(v)),
        })
        .collect::<Result<Vec<_>, _>>()?;

    // we sort the migrations so they are always applied in the correct order
    migration_directories.sort_by(|(_, a_time, _), (_, b_time, _)| a_time.cmp(&b_time));

    for (name, _, dir) in migration_directories {
        let migration_file_raw = dir
			.get_file(dir.path().join("./migration.sql"))
			.ok_or(MigrationError::InvalidEmbeddedMigration(
				"Failed to find 'migration.sql' file in '{}' migration subdirectory",
			))?
			.contents_utf8()
			.ok_or(
				MigrationError::InvalidEmbeddedMigration(
					"Failed to open the contents of 'migration.sql' file in '{}' migration subdirectory",
				)
			)?;

        // Generate SHA256 checksum of migration
        let mut checksum = Context::new(&SHA256);
        checksum.update(migration_file_raw.as_bytes());
        let checksum = HEXLOWER.encode(checksum.finish().as_ref());

        // get existing migration by checksum, if it doesn't exist run the migration
        if client
            .migration()
            .find_unique(migration::checksum::equals(checksum.clone()))
            .exec()
            .await?
            .is_none()
        {
            // Create migration record
            client
                .migration()
                .create(
                    migration::name::set(name.to_string()),
                    migration::checksum::set(checksum.clone()),
                    vec![],
                )
                .exec()
                .await?;

            // Split the migrations file up into each individual step and apply them all
            let steps = migration_file_raw.split(";").collect::<Vec<&str>>();
            let steps = &steps[0..steps.len() - 1];
            for (i, step) in steps.iter().enumerate() {
                client._execute_raw(raw!(*step)).await?;
                client
                    .migration()
                    .find_unique(migration::checksum::equals(checksum.clone()))
                    .update(vec![migration::steps_applied::set(i as i32 + 1)])
                    .exec()
                    .await?;
            }
        }
    }

    Ok(client)
}
