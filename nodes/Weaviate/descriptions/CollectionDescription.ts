import type { INodeProperties } from 'n8n-workflow';

export const collectionOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['collection'],
			},
		},
		options: [
			{
				name: 'Aggregate',
				value: 'aggregate',
				description: 'Aggregate data from a collection',
				action: 'Aggregate collection data',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new collection',
				action: 'Create a collection',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a collection',
				action: 'Delete a collection',
			},
			{
				name: 'Exists',
				value: 'exists',
				description: 'Check if a collection exists',
				action: 'Check if collection exists',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get collection details',
				action: 'Get a collection',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all collections',
				action: 'List collections',
			},
		],
		default: 'create',
	},
];

export const collectionFields: INodeProperties[] = [
	// CREATE operation fields
	{
		displayName: 'Collection Configuration (JSON)',
		name: 'collectionConfig',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				resource: ['collection'],
				operation: ['create'],
			},
		},
		default: '{\n  "name": "MyCollection"\n}',
		placeholder: '{\n  "name": "Article",\n  "description": "A collection of articles",\n  "vectorizers": {\n    "default": {\n      "vectorizer": "text2vec-openai"\n    }\n  },\n  "properties": [\n    {"name": "title", "dataType": ["text"]},\n    {"name": "content", "dataType": ["text"]}\n  ]\n}',
		description: 'Complete collection configuration as JSON object. See <a href="https://weaviate.io/developers/weaviate/manage-data/collections" target="_blank">Weaviate docs</a> for full schema.',
	},

	// DELETE and GET operations - use collection field
	{
		displayName: 'Collection',
		name: 'collectionName',
		type: 'resourceLocator',
		required: true,
		displayOptions: {
			show: {
				resource: ['collection'],
				operation: ['delete'],
			},
		},
		default: { mode: 'list', value: '' },
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'listCollections',
					searchable: true,
				},
			},
			{
				displayName: 'By Name',
				name: 'name',
				type: 'string',
				placeholder: 'e.g. MyCollection',
			},
		],
		description: 'The collection to delete',
	},
	{
		displayName: 'Collection Name',
		name: 'collectionName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['collection'],
				operation: ['exists'],
			},
		},
		default: '',
		placeholder: 'MyCollection',
		description: 'Name of the collection to check',
	},
	{
		displayName: 'Collection Name',
		name: 'collectionName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['collection'],
				operation: ['get'],
			},
		},
		default: '',
		placeholder: 'Article',
		description: 'Name of the collection',
	},

	// AGGREGATE operation fields
	{
		displayName: 'Collection',
		name: 'collection',
		type: 'resourceLocator',
		required: true,
		displayOptions: {
			show: {
				resource: ['collection'],
				operation: ['aggregate'],
			},
		},
		default: { mode: 'list', value: '' },
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'listCollections',
					searchable: true,
				},
			},
			{
				displayName: 'By Name',
				name: 'name',
				type: 'string',
				placeholder: 'e.g. Article',
			},
		],
		description: 'The collection to aggregate data from',
	},
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['collection'],
				operation: ['aggregate'],
			},
		},
		options: [
			{
				displayName: 'Tenant',
				name: 'tenant',
				type: 'string',
				default: '',
				placeholder: 'tenantName',
				description: 'Specify tenant for multi-tenancy',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 50,
				description: 'Max number of results to return',
			},
			{
				displayName: 'Filters (JSON)',
				name: 'filters',
				type: 'json',
				default: '',
				placeholder: '{"path": ["property"], "operator": "Equal", "valueText": "value"}',
				description: 'Filter conditions as JSON object. See <a href="https://weaviate.io/developers/weaviate/api/graphql/filters" target="_blank">Weaviate filters documentation</a>.',
			},
			{
				displayName: 'Group By Property',
				name: 'groupBy',
				type: 'string',
				default: '',
				placeholder: 'category',
				description: 'Property name to group aggregation results by',
			},
		],
	},
];
