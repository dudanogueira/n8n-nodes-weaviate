import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { getWeaviateClient } from '../../helpers/client';
import { buildOperationMetadata, parseJsonSafe, isNotEmpty } from '../../helpers/utils';

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const collectionName = this.getNodeParameter('collection', itemIndex, '', {
		extractValue: true,
	}) as string;
	const query = this.getNodeParameter('query', itemIndex) as string;
	const limit = this.getNodeParameter('limit', itemIndex, 10) as number;
	const additionalOptions = this.getNodeParameter('additionalOptions', itemIndex, {}) as {
		offset?: number;
		whereFilter?: string;
		returnProperties?: string;
		includeVector?: boolean;
		autocut?: number;
		tenant?: string;
		returnScore?: boolean;
		returnCreationTime?: boolean;
		targetVector?: string;
		rerank?: string;
	};

	const client = await getWeaviateClient.call(this, itemIndex);

	try {
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

		if (additionalOptions.tenant) {
			queryOptions.tenant = additionalOptions.tenant;
		}

		// Handle metadata returns
		const returnMetadata: string[] = [];
		if (additionalOptions.returnScore) {
			returnMetadata.push('score');
		}
		if (additionalOptions.returnCreationTime) {
			returnMetadata.push('creationTime');
		}
		if (returnMetadata.length > 0) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			queryOptions.returnMetadata = returnMetadata as any;
		}

		// Handle advanced options
		if (additionalOptions.targetVector) {
			queryOptions.targetVector = additionalOptions.targetVector;
		}

		if (additionalOptions.rerank) {
			queryOptions.rerank = parseJsonSafe(additionalOptions.rerank, 'rerank');
		}

		const result = await collection.query.bm25(query, queryOptions);

		return result.objects.map((obj: IDataObject) => ({
			json: {
				id: obj.uuid,
				properties: obj.properties,
				...(isNotEmpty(obj.vector) && { vector: obj.vector }),
				...(isNotEmpty(obj.vectors) && { vectors: obj.vectors }),
				metadata: {
					score: (obj.metadata as IDataObject)?.score,
					explainScore: (obj.metadata as IDataObject)?.explainScore,
					creationTime: (obj.metadata as IDataObject)?.creationTime,
					...buildOperationMetadata('search:bm25', {
						collectionName,
						query,
						resultCount: result.objects.length,
					}),
				},
			},
		}));
	} finally {
		await client.close();
	}
}
