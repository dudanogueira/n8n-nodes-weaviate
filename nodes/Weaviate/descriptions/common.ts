import type { INodeProperties } from 'n8n-workflow';

export const collectionField: INodeProperties = {
	displayName: 'Collection',
	name: 'collection',
	type: 'resourceLocator',
	default: { mode: 'list', value: '' },
	required: true,
	modes: [
		{
			displayName: 'From List',
			name: 'list',
			type: 'list',
			placeholder: 'Select a collection...',
			typeOptions: {
				searchListMethod: 'listCollections',
				searchable: true,
			},
		},
		{
			displayName: 'By Name',
			name: 'name',
			type: 'string',
			placeholder: 'e.g., Article',
			validation: [
				{
					type: 'regex',
					properties: {
						regex: '^[A-Z][a-zA-Z0-9_]*$',
						errorMessage: 'Collection name must start with an uppercase letter and contain only alphanumeric characters and underscores',
					},
				},
			],
		},
	],
};

export const limitField: INodeProperties = {
	displayName: 'Limit',
	name: 'limit',
	type: 'number',
	default: 50,
	description: 'Max number of results to return',
	typeOptions: {
		minValue: 1,
		maxValue: 10000,
	},
};

export const offsetField: INodeProperties = {
	displayName: 'Offset',
	name: 'offset',
	type: 'number',
	default: 0,
	description: 'Number of results to skip',
	displayOptions: {
		show: {
			'/additionalOptions.useOffset': [true],
		},
	},
};

export const filtersField: INodeProperties = {
	displayName: 'Filters',
	name: 'filters',
	type: 'json',
	default: '',
	placeholder: '{"path": ["propertyName"], "operator": "Equal", "valueText": "value"}',
	description: 'Where filters in JSON format. See <a href="https://weaviate.io/developers/weaviate/search/filters" target="_blank">Weaviate documentation</a> for filter syntax.',
	displayOptions: {
		show: {
			'/additionalOptions.useFilters': [true],
		},
	},
};

export const returnPropertiesField: INodeProperties = {
	displayName: 'Return Properties',
	name: 'returnProperties',
	type: 'string',
	default: '',
	placeholder: 'title, content, author',
	description: 'Comma-separated list of properties to return. Leave empty to return all properties.',
	displayOptions: {
		show: {
			'/additionalOptions.specifyProperties': [true],
		},
	},
};

export const tenantField: INodeProperties = {
	displayName: 'Tenant',
	name: 'tenant',
	type: 'string',
	default: '',
	placeholder: 'tenant-name',
	description: 'Tenant name for multi-tenancy support',
	displayOptions: {
		show: {
			'/additionalOptions.useTenant': [true],
		},
	},
};
