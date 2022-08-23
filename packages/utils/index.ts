/* eslint-disable no-mixed-spaces-and-tabs */
// This file was generated by [rspc](https://github.com/oscartbeaumont/rspc). Do not edit this file manually.

export type Operations = {
	queries:
		| { key: ['spaces.get']; result: Array<Spaces> }
		| { key: ['elements.get']; result: Array<Elements> }
		| { key: ['settings.get', GetSettingsArgs]; result: Settings | null };
	mutations:
		| { key: ['elements.create', CreateElementDataArgs]; result: null }
		| { key: ['settings.set', SetSettingsArgs]; result: Settings }
		| { key: ['spaces.create']; result: Spaces }
		| {
				key: ['spaces.updateSpaceIndexes', UpdateSpaceIndexesArgs];
				result: null;
		  };
	subscriptions: never;
};

export interface Element {
	content: string;
	type: string;
}

export interface Spaces {
	id: number;
	name: string;
	description: string;
	icon: string;
	color: string;
	index: number;
	createdAt: string;
	updatedAt: string;
	Elements: Array<Elements> | null;
}

export interface CreateElementDataArgs {
	space_id: number;
	type: string;
	value: Array<Element>;
}

export interface Elements {
	id: number;
	elementType: string;
	content: string;
	space: Spaces | null;
	positionX: number;
	positionY: number;
	createdAt: string;
	updatedAt: string;
	spaceId: number;
}

export interface GetSettingsArgs {
	key: string;
}

export interface Settings {
	id: number;
	name: string;
	value: string;
	createdAt: string;
	updatedAt: string;
}

export interface SetSettingsArgs {
	key: string;
	value: string;
}

export interface UpdateSpaceIndexesArgs {
	spaces: Array<Spaces>;
}
