import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getWeaviateClient } from '../../helpers/client';
import type { QueryMetadata } from 'weaviate-client';
import { buildOperationMetadata, parseJsonSafe, isNotEmpty } from '../../helpers/utils';
import { buildGenerativeConfig } from './config';

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
	};
	const generativeOptions = this.getNodeParameter('generativeOptions', itemIndex, {}) as IDataObject;

	if (!generativeOptions.singlePrompt && !generativeOptions.groupedTask) {
		throw new NodeOperationError(
			this.getNode(),
			'At least one of "Single Prompt" or "Grouped Task" must be provided when generative is enabled',
		);
	}

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

		if (additionalOptions.targetVector) {
			queryOptions.targetVector = additionalOptions.targetVector;
		}

		if (additionalOptions.rerank) {
			queryOptions.rerank = parseJsonSafe(additionalOptions.rerank, 'rerank');
		}

		const generateOptions: IDataObject = {};

		if (generativeOptions.singlePrompt) {
			generateOptions.singlePrompt = generativeOptions.singlePrompt as string;
		}

		if (generativeOptions.groupedTask) {
			generateOptions.groupedTask = generativeOptions.groupedTask as string;
		}

		if (generativeOptions.modelProvider) {
			const config = buildGenerativeConfig(
				generativeOptions.modelProvider as string,
				generativeOptions,
			);
			if (config) {
				generateOptions.config = config;
			}
		}

		const result = await collection.generate.nearMedia(mediaData, mediaType, generateOptions, queryOptions);

		const returnFormat = (this.getNodeParameter('additionalOptions', itemIndex, {}) as IDataObject).returnFormat || 'perObject';

		if (returnFormat === 'singleItem') {
			// Return entire result as a single item including generative fields
			return [{
				json: {
					objects: result.objects.map((obj: IDataObject) => ({
						id: obj.uuid,
						properties: obj.properties,
						...(isNotEmpty(obj.vector) && { vector: obj.vector }),
						...(isNotEmpty(obj.vectors) && { vectors: obj.vectors }),
						...(obj.generative && { generative: obj.generative }),
						metadata: {
							certainty: (obj.metadata as IDataObject)?.certainty,
							distance: (obj.metadata as IDataObject)?.distance,
							creationTime: (obj.metadata as IDataObject)?.creationTime,
						},
					})),
					...(result.generative && { generative: result.generative }),
					metadata: {
						totalCount: result.objects.length,
						provider: generativeOptions.modelProvider,
						...buildOperationMetadata('generate:nearMedia', {
							collectionName,
							mediaType,
							resultCount: result.objects.length,
							provider: generativeOptions.modelProvider,
						}),
					},
				},
			}];
		}

		// Return each object as a separate item (default)
		return result.objects.map((obj: IDataObject, index: number) => ({
			json: {
				id: obj.uuid,
				properties: obj.properties,
				...(isNotEmpty(obj.vector) && { vector: obj.vector }),
				...(isNotEmpty(obj.vectors) && { vectors: obj.vectors }),
				...(obj.generative && {
					generated: (obj.generative as IDataObject)?.text,
				}),
			// Add grouped task result (from groupedTask - only to first object)
			...(index === 0 && result.generative && {
				groupedGenerated: (result.generative as IDataObject)?.text,
			}),
				metadata: {
					certainty: (obj.metadata as IDataObject)?.certainty,
					distance: (obj.metadata as IDataObject)?.distance,
					creationTime: (obj.metadata as IDataObject)?.creationTime,
					...(obj.generative && {
						generativeMetadata: (obj.generative as IDataObject)?.metadata,
					}),
				// Add grouped task metadata
				...(index === 0 && result.generative && {
					groupedGenerativeMetadata: (result.generative as IDataObject)?.metadata,
				}),
					...buildOperationMetadata('generate:nearMedia', {
						collectionName,
						mediaType,
						resultCount: result.objects.length,
						provider: generativeOptions.modelProvider,
					}),
				},
			},
		}));
	} finally {
		await client.close();
	}
}
