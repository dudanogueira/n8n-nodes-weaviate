import type { INodeProperties } from 'n8n-workflow';
import { collectionField, limitField } from './common';

export const searchOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['search'],
			},
		},
		options: [
			{
				name: 'BM25',
				value: 'bm25',
				description: 'Keyword-based search using BM25 algorithm',
				action: 'Bm25 search',
			},
			{
				name: 'Near Text',
				value: 'nearText',
				description: 'Semantic search using text query',
				action: 'Near text search',
			},
			{
				name: 'Near Vector',
				value: 'nearVector',
				description: 'Vector similarity search using custom vector',
				action: 'Near vector search',
			},
			{
				name: 'Hybrid',
				value: 'hybrid',
				description: 'Hybrid search combining keyword and vector search',
				action: 'Hybrid search',
			},
		],
		default: 'nearText',
	},
];

export const searchFields: INodeProperties[] = [
	// Collection field for all operations
	{
		...collectionField,
		displayOptions: {
			show: {
				resource: ['search'],
			},
		},
	},

	// BM25 search fields
	{
		displayName: 'Query',
		name: 'query',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['search'],
				operation: ['bm25', 'hybrid'],
			},
		},
		default: '',
		placeholder: 'search query text',
		description: 'The keyword search query',
	},

	// Near Text search fields
	{
		displayName: 'Query Text',
		name: 'queryText',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['search'],
				operation: ['nearText'],
			},
		},
		default: '',
		placeholder: 'semantic search query',
		description: 'The text to search for semantically similar objects',
	},

	// Near Vector search fields
	{
		displayName: 'Query Vector',
		name: 'queryVector',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				resource: ['search'],
				operation: ['nearVector'],
			},
		},
		default: '',
		placeholder: '[0.1, 0.2, 0.3, ...]',
		description: 'The vector to search for similar objects',
	},

	// Limit field for all searches
	{
		...limitField,
		displayOptions: {
			show: {
				resource: ['search'],
			},
		},
	},

	// Additional options for all search operations
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['search'],
			},
		},
		options: [
			{
				displayName: 'Alpha',
				name: 'alpha',
				type: 'number',
				default: 0.5,
				typeOptions: {
					minValue: 0,
					maxValue: 1,
					numberPrecision: 2,
				},
				description: 'Weighting factor for hybrid search (0=BM25 only, 1=vector only)',
				displayOptions: {
					show: {
						'/operation': ['hybrid'],
					},
				},
			},
			{
				displayName: 'Autocut',
				name: 'autocut',
				type: 'number',
				default: 0,
				description: 'Enable autocut to dynamically limit results. Set to 1 or higher to enable.',
			},
			{
				displayName: 'Certainty',
				name: 'certainty',
				type: 'number',
				default: 0,
				typeOptions: {
					minValue: 0,
					maxValue: 1,
					numberPrecision: 2,
				},
				description: 'Minimum certainty threshold for results (0-1)',
				displayOptions: {
					show: {
						'/operation': ['nearText', 'nearVector'],
					},
				},
			},
			{
				displayName: 'Distance',
				name: 'distance',
				type: 'number',
				default: 0,
				description: 'Maximum distance threshold for results',
				displayOptions: {
					show: {
						'/operation': ['nearText', 'nearVector'],
					},
				},
			},
			{
				displayName: 'Include Vector',
				name: 'includeVector',
				type: 'boolean',
				default: false,
				description: 'Whether to include the vector in the results',
			},
			{
				displayName: 'Offset',
				name: 'offset',
				type: 'number',
				default: 0,
				description: 'Number of results to skip',
			},
			{
				displayName: 'Return Properties',
				name: 'returnProperties',
				type: 'string',
				default: '',
				placeholder: 'title, content, author',
				description: 'Comma-separated list of properties to return. Leave empty to return all.',
			},
			{
				displayName: 'Tenant',
				name: 'tenant',
				type: 'string',
				default: '',
				placeholder: 'tenant-name',
				description: 'Tenant name for multi-tenancy support',
			},
			{
				displayName: 'Where Filter',
				name: 'whereFilter',
				type: 'json',
				default: '',
				placeholder: '{"path": ["status"], "operator": "Equal", "valueText": "published"}',
				description: 'Filter to apply to search results',
			},
		],
	},
];
