import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { getWeaviateClient } from '../../helpers/client';
import { buildOperationMetadata, parseJsonSafe } from '../../helpers/utils';

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const collectionConfigJson = this.getNodeParameter('collectionConfig', itemIndex) as string;

	const client = await getWeaviateClient.call(this, itemIndex);

	try {
		// Parse the collection configuration JSON
		const collectionConfig = parseJsonSafe(collectionConfigJson, 'collectionConfig');

		// Create the collection
		await client.collections.create(collectionConfig as never);
		
		// Get the created collection config
		const collection = client.collections.get((collectionConfig as IDataObject).name as string);
		const config = await collection.config.get();

		return [
			{
				json: {
					success: true,
					collectionName: (collectionConfig as IDataObject).name,
					collection: config,
					metadata: buildOperationMetadata('collection:create', { collectionName: (collectionConfig as IDataObject).name }),
				},
			},
		];
	} finally {
		await client.close();
	}
}
