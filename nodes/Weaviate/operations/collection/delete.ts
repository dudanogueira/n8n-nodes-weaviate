import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { getWeaviateClient } from '../../helpers/client';
import { buildOperationMetadata } from '../../helpers/utils';

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const collectionNameRaw = this.getNodeParameter('collectionName', itemIndex) as string | { mode: string; value: string };

	// Handle resourceLocator format
	let collectionNamesInput: string;
	if (typeof collectionNameRaw === 'object' && collectionNameRaw.value) {
		collectionNamesInput = collectionNameRaw.value;
	} else {
		collectionNamesInput = collectionNameRaw as string;
	}

	// Parse comma-separated collection names
	const collectionNames = collectionNamesInput
		.split(',')
		.map((name) => name.trim())
		.filter((name) => name.length > 0);

	if (collectionNames.length === 0) {
		throw new Error('At least one collection name must be provided');
	}

	const client = await getWeaviateClient.call(this, itemIndex);

	try {
		const results: IDataObject[] = [];
		let successCount = 0;
		let failureCount = 0;

		for (const collectionName of collectionNames) {
			try {
				await client.collections.delete(collectionName);
				results.push({
					collectionName,
					success: true,
					message: `Collection "${collectionName}" deleted successfully`,
				});
				successCount++;
			} catch (error) {
				results.push({
					collectionName,
					success: false,
					error: (error as Error).message,
				});
				failureCount++;
			}
		}

		// If single collection, return simple format for backward compatibility
		if (collectionNames.length === 1) {
			return [
				{
					json: {
						success: results[0].success as boolean,
						collectionName: results[0].collectionName as string,
						message: results[0].success
							? `Collection "${results[0].collectionName}" deleted successfully`
							: (results[0].error as string),
						metadata: buildOperationMetadata('collection:delete', {
							collectionName: results[0].collectionName as string,
						}),
					},
				},
			];
		}

		// Multiple collections - return aggregate format
		return [
			{
				json: {
					success: successCount > 0,
					collections: results,
					totalCollections: collectionNames.length,
					successCount,
					failureCount,
					metadata: buildOperationMetadata('collection:delete', {
						collections: collectionNames,
						totalCollections: collectionNames.length,
						successCount,
						failureCount,
					}),
				},
			},
		];
	} finally {
		await client.close();
	}
}
