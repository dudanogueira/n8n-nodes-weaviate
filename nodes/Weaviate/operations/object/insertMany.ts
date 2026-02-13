import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { getWeaviateClient } from '../../helpers/client';
import { buildOperationMetadata, parseJsonSafe } from '../../helpers/utils';

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const collectionName = this.getNodeParameter('collection', itemIndex, '', {
		extractValue: true,
	}) as string;
	const objectsJson = this.getNodeParameter('objects', itemIndex) as string;
	const additionalOptions = this.getNodeParameter('additionalOptions', itemIndex, {}) as {
		tenant?: string;
	};

	const client = await getWeaviateClient.call(this, itemIndex);

	try {
		const objects = parseJsonSafe(objectsJson, 'objects');

		if (!Array.isArray(objects)) {
			throw new Error('Objects must be an array');
		}

		let collection = client.collections.get(collectionName);

		// If tenant is specified, use withTenant
		if (additionalOptions.tenant) {
			collection = collection.withTenant(additionalOptions.tenant);
		}

		const result = await collection.data.insertMany(objects);

		// Extract success and error information
		const successCount = result.uuids ? Object.keys(result.uuids).length : 0;
		const errorCount = result.errors ? Object.keys(result.errors).length : 0;

		return [
			{
				json: {
					success: errorCount === 0,
					inserted: successCount,
					errors: errorCount,
					uuids: result.uuids || {},
					errorDetails: result.errors || {},
					collectionName,
					metadata: buildOperationMetadata('object:insertMany', {
						collectionName,
						inserted: successCount,
						errors: errorCount,
					}),
				},
			},
		];
	} finally {
		await client.close();
	}
}
