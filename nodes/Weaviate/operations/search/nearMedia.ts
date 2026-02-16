import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { getWeaviateClient } from '../../helpers/client';
import type { QueryMetadata } from 'weaviate-client';
import { buildOperationMetadata, parseJsonSafe, isNotEmpty } from '../../helpers/utils';

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const collectionName = this.getNodeParameter('collection', itemIndex, '', {
		extractValue: true,
	}) as string;
	const mediaData = this.getNodeParameter('mediaData', itemIndex) as string;
	const mediaType = this.getNodeParameter('mediaType', itemIndex, 'audio') as 'audio' | 'video' | 'depth' | 'thermal' | 'imu';
	const limit = this.getNodeParameter('limit', itemIndex, 10) as number;
	const additionalOptions = this.getNodeParameter('additionalOptions', itemIndex, {}) as {
		offset?: number;
		whereFilter?: string;
		returnProperties?: string;
		includeVector?: boolean;
		autocut?: number;
		certainty?: number;
		distance?: number;
		tenant?: string;
		returnDistance?: boolean;
		returnCreationTime?: boolean;
		targetVector?: string;
		rerank?: string;
		returnFormat?: string;
	};

	const client = await getWeaviateClient.call(this, itemIndex);

	try {
		if (!mediaData || mediaData.trim() === '') {
			throw new Error('Media data must be provided as a base64 encoded string');
		}

		const collection = client.collections.get(collectionName);

		const queryOptions: IDataObject = {
			limit,
		};

		if (additionalOptions.offset) {
			queryOptions.offset = additionalOptions.offset;
		}

		if (additionalOptions.whereFilter) {
			queryOptions.where = parseJsonSafe(additionalOptions.whereFilter, 'whereFilter');
		}

		if (additionalOptions.returnProperties) {
			queryOptions.returnProperties = additionalOptions.returnProperties
				.split(',')
				.map((p) => p.trim());
		}

		if (additionalOptions.includeVector) {
			queryOptions.includeVector = true;
		}

		if (additionalOptions.autocut && additionalOptions.autocut > 0) {
			queryOptions.autoLimit = additionalOptions.autocut;
		}

		if (additionalOptions.certainty && additionalOptions.certainty > 0) {
			queryOptions.certainty = additionalOptions.certainty;
		}

		if (additionalOptions.distance && additionalOptions.distance > 0) {
			queryOptions.distance = additionalOptions.distance;
		}

		if (additionalOptions.tenant) {
			queryOptions.tenant = additionalOptions.tenant;
		}

		// Handle metadata returns
		const returnMetadata: (keyof import('weaviate-client').Metadata)[] = [];
		if (additionalOptions.returnDistance) {
			returnMetadata.push('distance');
		}
		if (additionalOptions.returnCreationTime) {
			returnMetadata.push('creationTime');
		}
		if (returnMetadata.length > 0) {
			queryOptions.returnMetadata = returnMetadata as QueryMetadata;
		}

		// Handle advanced options
		if (additionalOptions.targetVector) {
			queryOptions.targetVector = additionalOptions.targetVector;
		}

		if (additionalOptions.rerank) {
			queryOptions.rerank = parseJsonSafe(additionalOptions.rerank, 'rerank');
		}

		const result = await collection.query.nearMedia(mediaData, mediaType, queryOptions);

		const returnFormat = additionalOptions.returnFormat || 'perObject';

		if (returnFormat === 'singleItem') {
			// Return entire result as a single item
			return [{
				json: {
					objects: result.objects.map((obj: IDataObject) => ({
						id: obj.uuid,
						properties: obj.properties,
						...(isNotEmpty(obj.vector) && { vector: obj.vector }),
						...(isNotEmpty(obj.vectors) && { vectors: obj.vectors }),
						metadata: {
							certainty: (obj.metadata as IDataObject)?.certainty,
							distance: (obj.metadata as IDataObject)?.distance,
							creationTime: (obj.metadata as IDataObject)?.creationTime,
						},
					})),
					metadata: {
						totalCount: result.objects.length,
						...buildOperationMetadata('search:nearMedia', {
							collectionName,
							mediaType,
							resultCount: result.objects.length,
						}),
					},
				},
			}];
		}

		// Return each object as a separate item (default)
		return result.objects.map((obj: IDataObject) => ({
			json: {
				id: obj.uuid,
				properties: obj.properties,
				...(isNotEmpty(obj.vector) && { vector: obj.vector }),
				...(isNotEmpty(obj.vectors) && { vectors: obj.vectors }),
				metadata: {
					certainty: (obj.metadata as IDataObject)?.certainty,
					distance: (obj.metadata as IDataObject)?.distance,
					creationTime: (obj.metadata as IDataObject)?.creationTime,
					...buildOperationMetadata('search:nearMedia', {
						collectionName,
						mediaType,
						resultCount: result.objects.length,
					}),
				},
			},
		}));
	} finally {
		await client.close();
	}
}
