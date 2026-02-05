import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { getWeaviateClient } from '../../helpers/client';
import { buildOperationMetadata } from '../../helpers/utils';

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const collectionNameRaw = this.getNodeParameter('collectionName', itemIndex) as string | { mode: string; value: string };
	const tenantName = this.getNodeParameter('tenantName', itemIndex) as string;
	
	// Handle resourceLocator format
	let collectionName: string;
	if (typeof collectionNameRaw === 'object' && collectionNameRaw.value) {
		collectionName = collectionNameRaw.value;
	} else {
		collectionName = collectionNameRaw as string;
	}
	
	const client = await getWeaviateClient.call(this, itemIndex);

	try {
		const collection = client.collections.get(collectionName);
		await collection.tenants.create({ name: tenantName });

		return [
			{
				json: {
					success: true,
					collectionName,
					tenantName,
					message: `Tenant "${tenantName}" created successfully in collection "${collectionName}"`,
					metadata: buildOperationMetadata('tenant:create', { collectionName, tenantName }),
				},
			},
		];
	} finally {
		await client.close();
	}
}
