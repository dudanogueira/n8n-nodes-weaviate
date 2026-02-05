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
	const whereFilterJson = this.getNodeParameter('whereFilter', itemIndex) as string;
	const dryRun = this.getNodeParameter('dryRun', itemIndex, false) as boolean;
	const additionalOptions = this.getNodeParameter('additionalOptions', itemIndex, {}) as {
		tenant?: string;
	};

	const client = await getWeaviateClient.call(this, itemIndex);

	try {
		const whereFilter = parseJsonSafe(whereFilterJson, 'whereFilter');
		const collection = client.collections.get(collectionName);

		const deleteConfig: IDataObject = {
			where: whereFilter,
			dryRun,
		};

		if (additionalOptions.tenant) {
			deleteConfig.tenant = additionalOptions.tenant;
		}

		const result = await collection.data.deleteMany(deleteConfig as never);

		return [
			{
				json: {
					success: result.successful > 0,
					deleted: result.successful || 0,
					failed: result.failed || 0,
					dryRun,
					collectionName,
					metadata: buildOperationMetadata('object:deleteMany', {
						collectionName,
						deleted: result.successful || 0,
						failed: result.failed || 0,
						dryRun,
					}),
				},
			},
		];
	} finally {
		await client.close();
	}
}
