import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { getWeaviateClient } from '../../helpers/client';
import { buildOperationMetadata } from '../../helpers/utils';

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const client = await getWeaviateClient.call(this, itemIndex);

	try {
		const collections = await client.collections.listAll();
		
		let collectionNames: string[];
		// Handle if collections is an array or object
		if (Array.isArray(collections)) {
			collectionNames = collections.map((col: IDataObject) => (col.name as string) || (col as unknown as string));
		} else {
			collectionNames = Object.keys(collections);
		}

		return [
			{
				json: {
					collections: collectionNames.sort(),
					count: collectionNames.length,
					metadata: buildOperationMetadata('collection:list', { count: collectionNames.length }),
				},
			},
		];
	} finally {
		await client.close();
	}
}
