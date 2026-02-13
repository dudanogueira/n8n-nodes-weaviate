import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { getWeaviateClient } from '../../helpers/client';
import { buildOperationMetadata, parseJsonSafe, buildWeaviateFilter, isNotEmpty } from '../../helpers/utils';

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const collectionName = this.getNodeParameter('collection', itemIndex, '', {
		extractValue: true,
	}) as string;
	const limit = this.getNodeParameter('limit', itemIndex, 50) as number;
	const additionalOptions = this.getNodeParameter('additionalOptions', itemIndex, {}) as {
		offset?: number;
		whereFilter?: string;
		returnProperties?: string;
		includeVectors?: boolean;
		returnCreationTime?: boolean;
		returnUpdateTime?: boolean;
		tenant?: string;
	};

	const client = await getWeaviateClient.call(this, itemIndex);

	try {
		let collection = client.collections.get(collectionName);

		// If tenant is specified, use withTenant
		if (additionalOptions.tenant) {
			collection = collection.withTenant(additionalOptions.tenant);
		}

		// Build query options
		const queryOptions: IDataObject = {
			limit,
		};

		if (additionalOptions.offset) {
			queryOptions.offset = additionalOptions.offset;
		}

		if (additionalOptions.whereFilter) {
			const filterJson = parseJsonSafe(additionalOptions.whereFilter, 'whereFilter');
			// eslint-disable-next-line no-console
			console.log('Parsed whereFilter JSON:', JSON.stringify(filterJson, null, 2));
			// Build the filter using Weaviate's filter builder
			queryOptions.filters = buildWeaviateFilter(collection, filterJson);
		}

		if (additionalOptions.returnProperties) {
			queryOptions.returnProperties = additionalOptions.returnProperties
				.split(',')
				.map((p) => p.trim());
		}

		if (additionalOptions.includeVectors) {
			queryOptions.includeVector = true;
		}

		// Handle metadata returns
		const returnMetadata: string[] = [];
		if (additionalOptions.returnCreationTime) {
			returnMetadata.push('creationTime');
		}
		if (additionalOptions.returnUpdateTime) {
			returnMetadata.push('updateTime');
		}
		if (returnMetadata.length > 0) {
			queryOptions.returnMetadata = returnMetadata as any;
		}

		const result = await collection.query.fetchObjects(queryOptions);

		return result.objects.map((obj: IDataObject) => ({
			json: {
				id: obj.uuid,
				properties: obj.properties,
				...(isNotEmpty(obj.vector) && { vector: obj.vector }),
				...(isNotEmpty(obj.vectors) && { vectors: obj.vectors }),
				metadata: {
					creationTime: (obj.metadata as IDataObject)?.creationTime,
					updateTime: (obj.metadata as IDataObject)?.updateTime,
					...buildOperationMetadata('object:getMany', {
						collectionName,
						resultCount: result.objects.length,
						limit,
						offset: additionalOptions.offset || 0,
					}),
				},
			},
		}));
	} finally {
		await client.close();
	}
}
