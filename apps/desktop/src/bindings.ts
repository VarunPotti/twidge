/* eslint-disable */
// This file was generated by [rspc](https://github.com/oscartbeaumont/rspc). Do not edit this file manually.

export type Procedures = {
	queries:
		| { key: "misc.is_online"; input: never; result: boolean }
		| { key: "misc.run_migrations"; input: never; result: null }
		| { key: "settings.get"; input: GetSettingsArgs; result: Array<Settings> }
		| { key: "spaces.get"; input: never; result: Array<Space> }
		| { key: "version"; input: never; result: string };
	mutations:
		| { key: "settings.set"; input: SetSettingsArgs; result: null }
		| { key: "spaces.create"; input: CreateSpaceArgs; result: Space };
	subscriptions: never;
};

export interface CreateSpaceArgs {
	icon: string;
	color: string;
	name: string;
	description: string;
	accent_color: string;
	primary_color: string;
}

export interface GetSettingsArgs {
	key: string;
}

export interface SetSettingsArgs {
	key: string;
	value: string;
}

export interface Settings {
	id: number;
	key: string;
	value: string;
}

export interface Space {
	id: number;
	name: string;
	icon: string;
	color: string;
	description: string;
	primaryColor: string;
	accentColor: string;
	created_at: string;
	updated_at: string;
}
