import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { getWeaviateClient } from '../../helpers/client';

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const collectionNameRaw = this.getNodeParameter('collectionName', itemIndex) as string | { mode: string; value: string };
	
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
		
		// Return each tenant as a separate item
		const results: INodeExecutionData[] = [];
		
		if (Array.isArray(tenants)) {
			for (const tenant of tenants) {
				results.push({
					json: {
						collectionName,
						name: tenant.name || tenant.toString(),
						activityStatus: tenant.activityStatus || 'ACTIVE',
						...tenant,
					},
					pairedItem: { item: itemIndex },
				});
			}
		} else {
			// If it's not an array, try to extract tenant information
			results.push({
				json: {
					collectionName,
					tenants: tenants,
				},
				pairedItem: { item: itemIndex },
			});
		}
		
		// If no tenants found, return empty result with collection info
		if (results.length === 0) {
			results.push({
				json: {
					collectionName,
					message: 'No tenants found',
					count: 0,
				},
				pairedItem: { item: itemIndex },
			});
		}

		return results;
	} finally {
		await client.close();
	}
}
