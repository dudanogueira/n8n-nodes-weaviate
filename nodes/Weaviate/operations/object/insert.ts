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
		let collection = client.collections.get(collectionName);

		// If tenant is specified, use withTenant
		if (additionalOptions.tenant) {
			collection = collection.withTenant(additionalOptions.tenant);
		}

		const insertConfig: IDataObject = {
			properties,
		};

		if (vectorJson) {
			const vector = parseJsonSafe(vectorJson, 'vector');
			if (Array.isArray(vector) && vector.length > 0) {
				insertConfig.vectors = vector;
				
			}
		}

		if (objectId) {
			insertConfig.id = objectId;
		}
		console.log('Insert Config:', insertConfig);
		const result = await collection.data.insert(insertConfig);

		return [
			{
				json: {
					success: true,
					id: result,
					collectionName,
					tenant: additionalOptions.tenant,
					metadata: buildOperationMetadata('object:insert', {
						collectionName,
						objectId: result,
						tenant: additionalOptions.tenant,
					}),
				},
			},
		];
	} finally {
		await client.close();
	}
}
