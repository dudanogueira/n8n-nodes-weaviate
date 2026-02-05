import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { getWeaviateClient } from '../../helpers/client';
import { buildOperationMetadata } from '../../helpers/utils';

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const backend = this.getNodeParameter('backend', itemIndex) as string;
	const client = await getWeaviateClient.call(this, itemIndex);

	try {
		// Note: The SDK might not have a direct list method, so we may need to use REST API
		// For now, we'll return a placeholder that indicates the operation would list backups
		// This would need to be implemented using the REST API directly

		return [
			{
				json: {
					backend,
					message: 'List backups operation - implementation depends on Weaviate version',
					metadata: buildOperationMetadata('backup:list', {
						backend,
					}),
				},
			},
		];
	} finally {
		await client.close();
	}
}
