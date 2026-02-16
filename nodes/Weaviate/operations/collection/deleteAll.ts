import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { getWeaviateClient } from '../../helpers/client';
import { buildOperationMetadata } from '../../helpers/utils';

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const client = await getWeaviateClient.call(this, itemIndex);

	try {
		// Delete all collections from the Weaviate instance
		await client.collections.deleteAll();

		return [
			{
				json: {
					success: true,
					message: 'All collections deleted successfully',
					metadata: buildOperationMetadata('collection:deleteAll', {
						operation: 'deleteAll',
					}),
				},
			},
		];
	} finally {
		await client.close();
	}
}
