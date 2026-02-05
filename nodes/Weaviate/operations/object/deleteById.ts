import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { getWeaviateClient } from '../../helpers/client';
import { buildOperationMetadata } from '../../helpers/utils';

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const collectionName = this.getNodeParameter('collection', itemIndex, '', {
		extractValue: true,
	}) as string;
	const objectId = this.getNodeParameter('objectId', itemIndex) as string;
	const additionalOptions = this.getNodeParameter('additionalOptions', itemIndex, {}) as {
		tenant?: string;
	};

	const client = await getWeaviateClient.call(this, itemIndex);

	try {
		const collection = client.collections.get(collectionName);

		const deleteConfig: IDataObject = {
			id: objectId,
		};

		if (additionalOptions.tenant) {
			deleteConfig.tenant = additionalOptions.tenant;
		}

		await collection.data.deleteById(deleteConfig as never);

		return [
			{
				json: {
					success: true,
					id: objectId,
					collectionName,
					message: `Object ${objectId} deleted successfully`,
					metadata: buildOperationMetadata('object:deleteById', {
						collectionName,
						objectId,
					}),
				},
			},
		];
	} finally {
		await client.close();
	}
}
