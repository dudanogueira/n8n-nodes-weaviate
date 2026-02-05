import type { INodeProperties } from 'n8n-workflow';

export const backupOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['backup'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new backup',
				action: 'Create a backup',
			},
			{
				name: 'Get Create Status',
				value: 'getCreateStatus',
				description: 'Get the status of a backup creation',
				action: 'Get backup creation status',
			},
			{
				name: 'Get Restore Status',
				value: 'getRestoreStatus',
				description: 'Get the status of a backup restoration',
				action: 'Get backup restore status',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all backups',
				action: 'List backups',
			},
			{
				name: 'Restore',
				value: 'restore',
				description: 'Restore from a backup',
				action: 'Restore a backup',
			},
		],
		default: 'create',
	},
];

export const backupFields: INodeProperties[] = [
	// Backend field for all operations
	{
		displayName: 'Backend',
		name: 'backend',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['backup'],
			},
		},
		options: [
			{
				name: 'Filesystem',
				value: 'filesystem',
				description: 'Local filesystem backend',
			},
			{
				name: 'S3',
				value: 's3',
				description: 'AWS S3 backend',
			},
			{
				name: 'GCS',
				value: 'gcs',
				description: 'Google Cloud Storage backend',
			},
			{
				name: 'Azure',
				value: 'azure',
				description: 'Azure Blob Storage backend',
			},
		],
		default: 'filesystem',
		description: 'The backup backend to use',
	},

	// CREATE operation fields
	{
		displayName: 'Backup ID',
		name: 'backupId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['backup'],
				operation: ['create'],
			},
		},
		default: '',
		placeholder: 'my-backup-2024',
		description: 'Unique identifier for the backup',
	},
	{
		displayName: 'Include Collections',
		name: 'includeCollections',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['backup'],
				operation: ['create'],
			},
		},
		default: '',
		placeholder: 'Article, Product',
		description: 'Comma-separated list of collections to include. Leave empty to backup all.',
	},
	{
		displayName: 'Exclude Collections',
		name: 'excludeCollections',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['backup'],
				operation: ['create'],
			},
		},
		default: '',
		placeholder: 'TempData',
		description: 'Comma-separated list of collections to exclude',
	},
	{
		displayName: 'Wait for Completion',
		name: 'waitForCompletion',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['backup'],
				operation: ['create'],
			},
		},
		default: true,
		description: 'Whether to wait for the backup to complete before returning',
	},

	// RESTORE operation fields
	{
		displayName: 'Backup ID',
		name: 'backupId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['backup'],
				operation: ['restore', 'getCreateStatus', 'getRestoreStatus'],
			},
		},
		default: '',
		placeholder: 'my-backup-2024',
		description: 'Identifier of the backup',
	},
	{
		displayName: 'Include Collections',
		name: 'includeCollections',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['backup'],
				operation: ['restore'],
			},
		},
		default: '',
		placeholder: 'Article, Product',
		description: 'Comma-separated list of collections to restore. Leave empty to restore all.',
	},
	{
		displayName: 'Exclude Collections',
		name: 'excludeCollections',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['backup'],
				operation: ['restore'],
			},
		},
		default: '',
		placeholder: 'TempData',
		description: 'Comma-separated list of collections to exclude from restore',
	},
	{
		displayName: 'Wait for Completion',
		name: 'waitForCompletion',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['backup'],
				operation: ['restore'],
			},
		},
		default: true,
		description: 'Whether to wait for the restore to complete before returning',
	},
];
