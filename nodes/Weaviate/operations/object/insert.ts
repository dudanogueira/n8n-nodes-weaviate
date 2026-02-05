import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { getWeaviateClient } from '../../helpers/client';
import { buildOperationMetadata, parseJsonSafe } from '../../helpers/utils';

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const collectionName = this.getNodeParameter('collection', itemIndex, '', {
		extractValue: true,
	}) as string;
	const propertiesJson = this.getNodeParameter('properties', itemIndex) as string;
	const vectorJson = this.getNodeParameter('vector', itemIndex, '') as string;
	const objectId = this.getNodeParameter('objectId', itemIndex, '') as string;
	const additionalOptions = this.getNodeParameter('additionalOptions', itemIndex, {}) as {
		tenant?: string;
	};

	const client = await getWeaviateClient.call(this, itemIndex);

	try {
		const properties = parseJsonSafe(propertiesJson, 'properties');
		const collection = client.collections.get(collectionName);

		const insertConfig: IDataObject = {
			properties,
		};

		if (vectorJson) {
			const vector = parseJsonSafe(vectorJson, 'vector');
			if (Array.isArray(vector)) {
				insertConfig.vectors = vector;
			}
		}

		if (objectId) {
			insertConfig.id = objectId;
		}

		if (additionalOptions.tenant) {
			insertConfig.tenant = additionalOptions.tenant;
		}

		const result = await collection.data.insert(insertConfig);

		return [
			{
				json: {
					success: true,
					id: result,
					collectionName,
					metadata: buildOperationMetadata('object:insert', {
						collectionName,
						objectId: result,
					}),
				},
			},
		];
	} finally {
		await client.close();
	}
}
