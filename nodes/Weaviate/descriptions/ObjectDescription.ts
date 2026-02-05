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
		description: 'Vector embedding as JSON array. Leave empty to use collection vectorizer.',
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
		description: 'Optional UUID for the object. If not provided, one will be generated.',
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
				displayName: 'Tenant',
				name: 'tenant',
				type: 'string',
				default: '',
				placeholder: 'tenant-name',
				description: 'Tenant name for multi-tenancy support',
			},
		],
	},
];
