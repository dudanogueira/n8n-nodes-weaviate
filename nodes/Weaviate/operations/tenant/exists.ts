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
		const tenants = await collection.tenants.get();
		
		// tenants.get() returns an array of tenant objects
		const tenantArray = Array.isArray(tenants) ? tenants : [tenants];
		const exists = tenantArray.some((t: any) => t.name === tenantName);

		return [
			{
				json: {
					collectionName,
					tenantName,
					exists,
					metadata: buildOperationMetadata('tenant:exists', { collectionName, tenantName }),
				},
			},
		];
	} finally {
		await client.close();
	}
}
