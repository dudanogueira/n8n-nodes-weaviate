import type { INodeProperties } from 'n8n-workflow';
import { collectionField } from './common';

export const objectOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['object'],
			},
		},
		options: [
			{
				name: 'Delete by ID',
				value: 'deleteById',
				description: 'Delete an object by its ID',
				action: 'Delete an object by ID',
			},
			{
				name: 'Delete Many',
				value: 'deleteMany',
				description: 'Delete multiple objects using filters',
				action: 'Delete many objects',
			},
			{
				name: 'Get by ID',
				value: 'getById',
				description: 'Get an object by its ID',
				action: 'Get an object by ID',
			},
			{
				name: 'Insert',
				value: 'insert',
				description: 'Insert a single object',
				action: 'Insert an object',
			},
			{
				name: 'Insert Many',
				value: 'insertMany',
				description: 'Insert multiple objects in batch',
				action: 'Insert many objects',
			},
		],
		default: 'insert',
	},
];

export const objectFields: INodeProperties[] = [
	// Collection field for all operations
	{
		...collectionField,
		displayOptions: {
			show: {
				resource: ['object'],
			},
		},
	},

	// INSERT operation fields
	{
		displayName: 'Properties',
		name: 'properties',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				resource: ['object'],
				operation: ['insert'],
			},
		},
		default: '{}',
		placeholder: '{"title": "My Article", "content": "Article content here"}',
		description: 'Object properties as JSON',
	},
	{
		displayName: 'Vector',
		name: 'vector',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['object'],
				operation: ['insert'],
			},
		},
		default: '',
		placeholder: '[0.1, 0.2, 0.3, ...]',
		description: 'Optional: Vector embedding as JSON array. Leave empty to use collection vectorizer or auto-generate.',
	},
	{
		displayName: 'Object ID',
		name: 'objectId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['object'],
				operation: ['insert'],
			},
		},
		default: '',
		placeholder: '00000000-0000-0000-0000-000000000000',
		description: 'Optional: Custom UUID for the object. Leave empty to auto-generate a unique ID.',
	},

	// INSERT MANY operation fields
	{
		displayName: 'Objects',
		name: 'objects',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				resource: ['object'],
				operation: ['insertMany'],
			},
		},
		default: '[]',
		placeholder: '[{"properties": {"title": "Article 1"}}, {"properties": {"title": "Article 2"}}]',
		description: 'Array of objects to insert. Each object should have a "properties" field.',
	},

	// DELETE BY ID operation fields
	{
		displayName: 'Object ID',
		name: 'objectId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['object'],
				operation: ['deleteById'],
			},
		},
		default: '',
		placeholder: '00000000-0000-0000-0000-000000000000',
		description: 'UUID of the object to delete',
	},

	// GET BY ID operation fields
	{
		displayName: 'Object ID',
		name: 'objectId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['object'],
				operation: ['getById'],
			},
		},
		default: '',
		placeholder: '00000000-0000-0000-0000-000000000000',
		description: 'UUID of the object to retrieve',
	},

	// DELETE MANY operation fields
	{
		displayName: 'Where Filter',
		name: 'whereFilter',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				resource: ['object'],
				operation: ['deleteMany'],
			},
		},
		default: '{}',
		placeholder: '{"path": ["status"], "operator": "Equal", "valueText": "draft"}',
		description: 'Filter to select objects to delete',
	},
	{
		displayName: 'Dry Run',
		name: 'dryRun',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['object'],
				operation: ['deleteMany'],
			},
		},
		default: false,
		description: 'Whether to perform a dry run (count objects without deleting)',
	},

	// Additional options for all object operations
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['object'],
			},
		},
		options: [
			{
				displayName: 'Include Vectors',
				name: 'includeVectors',
				type: 'boolean',
				default: false,
				description: 'Whether to include vector embeddings in the response',
				displayOptions: {
					show: {
						'/operation': ['getById'],
					},
				},
			},
			{
				displayName: 'Tenant',
				name: 'tenant',
				type: 'string',
				default: '',
				placeholder: 'tenant-name',
				description: 'Optional: Tenant name for multi-tenancy support. Leave empty if not using multi-tenancy.',
			},
		],
	},
];
