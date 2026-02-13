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
				name: 'Near Object',
				value: 'nearObject',
				description: 'Find similar objects to an existing object by its UUID',
				action: 'Near object search',
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

	// Near Object search fields
	{
		displayName: 'Object ID',
		name: 'objectId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['search'],
				operation: ['nearObject'],
			},
		},
		default: '',
		placeholder: 'e.g., 00000000-0000-0000-0000-000000000000',
		description: 'The UUID of the object to find similar objects to',
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
						'/operation': ['nearText', 'nearVector', 'nearObject'],
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
						'/operation': ['nearText', 'nearVector', 'nearObject'],
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
				displayName: 'Filters',
				name: 'whereFilter',
				type: 'json',
				default: '',
				placeholder: '{"path": ["status"], "operator": "Equal", "valueText": "published"}',
				description: 'Filter to apply to search results. See <a href="https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.vectorstoreweaviate/#search-filters" target="_blank">filter documentation</a>.',
			},
			// Metadata Return Options
			{
				displayName: 'Return Distance',
				name: 'returnDistance',
				type: 'boolean',
				default: false,
				description: 'Whether to return the distance metric in the results',
				displayOptions: {
					show: {
						'/operation': ['nearText', 'nearVector', 'nearObject'],
					},
				},
			},
			{
				displayName: 'Return Score',
				name: 'returnScore',
				type: 'boolean',
				default: false,
				description: 'Whether to return the score metric in the results',
				displayOptions: {
					show: {
						'/operation': ['bm25', 'hybrid'],
					},
				},
			},
			{
				displayName: 'Return Explain Score',
				name: 'returnExplainScore',
				type: 'boolean',
				default: false,
				description: 'Whether to return the explanation of the score in the results',
				displayOptions: {
					show: {
						'/operation': ['hybrid'],
					},
				},
			},
			{
				displayName: 'Return Creation Time',
				name: 'returnCreationTime',
				type: 'boolean',
				default: false,
				description: 'Whether to return the creation timestamp in the results',
			},
			// Advanced Options
			{
				displayName: 'Target Vector',
				name: 'targetVector',
				type: 'string',
				default: '',
				placeholder: 'vectorName',
				description: 'Target vector name for named vectors in multi-vector collections',
				displayOptions: {
					show: {
						'/operation': ['nearText', 'nearVector', 'nearObject', 'hybrid'],
					},
				},
			},
			{
				displayName: 'Move Away',
				name: 'moveAway',
				type: 'json',
				default: '',
				placeholder: '{"concepts": ["feline"], "force": 0.6}',
				description: 'Move results away from these concepts. Example: <code>{"concepts": ["feline"], "force": 0.6}</code>',
				displayOptions: {
					show: {
						'/operation': ['nearText'],
					},
				},
			},
			{
				displayName: 'Move Towards',
				name: 'moveTowards',
				type: 'json',
				default: '',
				placeholder: '{"concepts": ["canine"], "force": 0.8}',
				description: 'Move results towards these concepts. Example: <code>{"concepts": ["canine"], "force": 0.8}</code>',
				displayOptions: {
					show: {
						'/operation': ['nearText'],
					},
				},
			},
			{
				displayName: 'Rerank',
				name: 'rerank',
				type: 'json',
				default: '',
				placeholder: '{"property": "text", "query": "most relevant results"}',
				description: 'Rerank results using a reranker. Example: <code>{"property": "text", "query": "most relevant results"}</code>',
			},
		],
	},
];
