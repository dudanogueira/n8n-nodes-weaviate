import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	ILoadOptionsFunctions,
	INodePropertyOptions,
	INodeListSearchResult,
	IDataObject,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { collectionOperations, collectionFields } from './descriptions/CollectionDescription';
import { objectOperations, objectFields } from './descriptions/ObjectDescription';
import { searchOperations, searchFields } from './descriptions/SearchDescription';
import { backupOperations, backupFields } from './descriptions/BackupDescription';
import { tenantOperations, tenantFields } from './descriptions/TenantDescription';

import { getWeaviateClient } from './helpers/client';

export class Weaviate implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Weaviate',
		name: 'weaviate',
		icon: 'file:weaviate.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{($parameter["resource"] === "search" && $parameter["enableGenerative"]) ? "Search and Generative: " + $parameter["operation"] : $parameter["resource"] + ": " + $parameter["operation"]}}',
		description: 'Interact with Weaviate vector database',
		defaults: {
			name: 'Weaviate',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'weaviateApi',
				required: true,
			},
		],
		usableAsTool: true,
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Backup',
						value: 'backup',
						description: 'Manage backups',
					},
					{
						name: 'Collection',
						value: 'collection',
						description: 'Manage collections (schemas)',
					},
					{
						name: 'Object',
						value: 'object',
						description: 'Manage data objects',
					},
					{
						name: 'Search and Generative',
						value: 'search',
						description: 'Search and query data with optional generative AI',
					},
					{
						name: 'Tenant',
						value: 'tenant',
						description: 'Manage multi-tenancy',
					},
				],
				default: 'collection',
			},
			...collectionOperations,
			...collectionFields,
			...objectOperations,
			...objectFields,
			...searchOperations,
			...searchFields,
			...backupOperations,
			...backupFields,
			...tenantOperations,
			...tenantFields,
		],
	};

	methods = {
		loadOptions: {
			async listCollections(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const client = await getWeaviateClient.call(this as unknown as IExecuteFunctions, 0);
				try {
					const collections = await client.collections.listAll();
					const result = Object.keys(collections).map((name) => ({
						name,
						value: name,
					}));
					return result;
				} catch (error) {
					throw new NodeOperationError(
						this.getNode(),
						`Failed to list collections: ${(error as Error).message}`,
					);
				} finally {
					await client.close();
				}
			},
		},
		listSearch: {
			async listCollections(
				this: ILoadOptionsFunctions,
				filter?: string,
			): Promise<INodeListSearchResult> {
				const client = await getWeaviateClient.call(this as unknown as IExecuteFunctions, 0);
				try {
					const collections = await client.collections.listAll();
					
					let collectionNames: string[];
					
					// Handle if collections is an array or object
					if (Array.isArray(collections)) {
						collectionNames = collections.map((col: IDataObject) => (col.name as string) || (col as unknown as string));
					} else {
						collectionNames = Object.keys(collections);
					}
					
					// Apply filter if provided
					if (filter) {
						collectionNames = collectionNames.filter((name) =>
							name.toLowerCase().includes(filter.toLowerCase()),
						);
					}
					
					// Sort alphabetically
					collectionNames.sort();
					
					const results = collectionNames.map((name) => ({
						name,
						value: name,
					}));
					
					return {
						results,
					};
				} catch (error) {
					throw new NodeOperationError(
						this.getNode(),
						`Failed to list collections: ${(error as Error).message}`,
					);
				} finally {
					await client.close();
				}
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0);
		const operation = this.getNodeParameter('operation', 0);

		for (let i = 0; i < items.length; i++) {
			try {
				let result: INodeExecutionData[] = [];

				if (resource === 'collection') {
					const { execute: executeCollection } = await import(
						`./operations/collection/${operation}`
					);
					result = await executeCollection.call(this, i);
				} else if (resource === 'object') {
					const { execute: executeObject } = await import(`./operations/object/${operation}`);
					result = await executeObject.call(this, i);
				} else if (resource === 'search') {
					const enableGenerative = this.getNodeParameter('enableGenerative', i, false) as boolean;

					if (enableGenerative) {
						// Route to generate operations
						const { execute: executeGenerate } = await import(
							`./operations/generate/${operation}`
						);
						result = await executeGenerate.call(this, i);
					} else {
						// Route to regular search operations
						const { execute: executeSearch } = await import(`./operations/search/${operation}`);
						result = await executeSearch.call(this, i);
					}
				} else if (resource === 'backup') {
					const { execute: executeBackup } = await import(`./operations/backup/${operation}`);
					result = await executeBackup.call(this, i);
				} else if (resource === 'tenant') {
					const { execute: executeTenant } = await import(`./operations/tenant/${operation}`);
					result = await executeTenant.call(this, i);
				}

				returnData.push(...result);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: (error as Error).message,
						},
						pairedItem: { item: i },
					});
					continue;
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
