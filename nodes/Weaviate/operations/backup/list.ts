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
		const backups = await client.backup.list(backend as never);
		
		// The response should be an array of backup objects
		const backupArray = Array.isArray(backups) ? backups : [backups];
		
		// Return each backup as a separate item
		const results: INodeExecutionData[] = backupArray.map((backup: any) => ({
			json: {
				backend,
				id: backup.id,
				status: backup.status,
				path: backup.path,
				...backup,
				metadata: buildOperationMetadata('backup:list', { backend }),
			},
			pairedItem: { item: itemIndex },
		}));
		
		// If no backups found, return empty result
		if (results.length === 0) {
			results.push({
				json: {
					backend,
					message: 'No backups found',
					backups: [],
					metadata: buildOperationMetadata('backup:list', { backend }),
				},
				pairedItem: { item: itemIndex },
			});
		}

		return results;
	} finally {
		await client.close();
	}
}
