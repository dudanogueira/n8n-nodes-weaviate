import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { getWeaviateClient } from '../../helpers/client';
import { buildOperationMetadata } from '../../helpers/utils';

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const backend = this.getNodeParameter('backend', itemIndex) as string;
	const backupId = this.getNodeParameter('backupId', itemIndex) as string;
	const includeCollections = this.getNodeParameter('includeCollections', itemIndex, '') as string;
	const excludeCollections = this.getNodeParameter('excludeCollections', itemIndex, '') as string;
	const waitForCompletion = this.getNodeParameter('waitForCompletion', itemIndex, true) as boolean;

	const client = await getWeaviateClient.call(this, itemIndex);

	try {
		const backupConfig: IDataObject = {
			id: backupId,
		};

		if (includeCollections) {
			backupConfig.include = includeCollections.split(',').map((c) => c.trim());
		}

		if (excludeCollections) {
			backupConfig.exclude = excludeCollections.split(',').map((c) => c.trim());
		}

		const result = await client.backup.create({
			backend: backend as never,
			backupId,
			includeCollections: backupConfig.include as string[] | undefined,
			excludeCollections: backupConfig.exclude as string[] | undefined,
			waitForCompletion,
		});

		return [
			{
				json: {
					success: true,
					backupId,
					backend,
					status: result.status,
					result,
					metadata: buildOperationMetadata('backup:create', {
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
