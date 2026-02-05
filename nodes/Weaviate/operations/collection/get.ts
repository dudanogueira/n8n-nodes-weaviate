import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { getWeaviateClient } from '../../helpers/client';
import { buildOperationMetadata } from '../../helpers/utils';

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const collectionName = this.getNodeParameter('collectionName', itemIndex) as string;
	const client = await getWeaviateClient.call(this, itemIndex);

	try {
		const collection = client.collections.get(collectionName);
		const config = await collection.config.get();

		return [
			{
				json: {
					collectionName,
					config,
					metadata: buildOperationMetadata('collection:get', { collectionName }),
				},
			},
		];
	} finally {
		await client.close();
	}
}
