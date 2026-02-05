import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { getWeaviateClient } from '../../helpers/client';
import { buildOperationMetadata } from '../../helpers/utils';

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const backend = this.getNodeParameter('backend', itemIndex) as string;
	const backupId = this.getNodeParameter('backupId', itemIndex) as string;

	const client = await getWeaviateClient.call(this, itemIndex);

	try {
		const result = await client.backup.getCreateStatus({
			backend: backend as never,
			backupId,
		});

		return [
			{
				json: {
					backupId,
					backend,
					status: result.status,
					result,
					metadata: buildOperationMetadata('backup:getCreateStatus', {
						backupId,
						backend,
						status: result.status,
					}),
				},
			},
		];
	} finally {
		await client.close();
	}
}
