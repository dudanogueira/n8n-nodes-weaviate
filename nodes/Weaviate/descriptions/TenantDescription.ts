import type { INodeProperties } from 'n8n-workflow';

export const tenantOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['tenant'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a tenant in a collection',
				action: 'Create a tenant',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a tenant from a collection',
				action: 'Delete a tenant',
			},
			{
				name: 'Exists',
				value: 'exists',
				description: 'Check if a tenant exists',
				action: 'Check if tenant exists',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all tenants and their status in a collection',
				action: 'List all tenants',
			},
			{
				name: 'Update Status',
				value: 'updateStatus',
				description: 'Update tenant status (active, inactive, frozen)',
				action: 'Update tenant status',
			},
		],
		default: 'create',
	},
];

export const tenantFields: INodeProperties[] = [
	// Collection name field for all operations
	{
		displayName: 'Collection',
		name: 'collectionName',
		type: 'resourceLocator',
		required: true,
		displayOptions: {
			show: {
				resource: ['tenant'],
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
		description: 'The collection to manage tenants in',
	},

	// Tenant name for specific operations
	{
		displayName: 'Tenant Name',
		name: 'tenantName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['tenant'],
				operation: ['create', 'delete', 'exists', 'updateStatus'],
			},
		},
		default: '',
		placeholder: 'tenant1',
		description: 'Name of the tenant',
	},

	// Status field for updateStatus operation
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['tenant'],
				operation: ['updateStatus'],
			},
		},
		options: [
			{
				name: 'Active',
				value: 'ACTIVE',
				description: 'Tenant is active and can be used',
			},
			{
				name: 'Inactive',
				value: 'INACTIVE',
				description: 'Tenant is inactive',
			},
			{
				name: 'Frozen',
				value: 'FROZEN',
				description: 'Tenant is frozen (read-only)',
			},
		],
		default: 'ACTIVE',
		description: 'The new status for the tenant',
	},
];
