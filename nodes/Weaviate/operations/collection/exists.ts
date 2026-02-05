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
		const exists = await client.collections.exists(collectionName);

		return [
			{
				json: {
					collectionName,
					exists,
					metadata: buildOperationMetadata('collection:exists', { collectionName }),
				},
			},
		];
	} finally {
		await client.close();
	}
}
