import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { getWeaviateClient } from '../../helpers/client';
import { buildOperationMetadata } from '../../helpers/utils';

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const collectionName = this.getNodeParameter('collection', itemIndex, '', {
		extractValue: true,
	}) as string;

	const additionalOptions = this.getNodeParameter('additionalOptions', itemIndex, {}) as {
		tenant?: string;
		limit?: number;
		groupBy?: string;
	};

	const client = await getWeaviateClient.call(this, itemIndex);

	try {
		let collection = client.collections.get(collectionName);

		// If tenant is specified, use withTenant
		if (additionalOptions.tenant) {
			collection = collection.withTenant(additionalOptions.tenant);
		}

		// Check if group by is requested
		if (additionalOptions.groupBy) {
			// Group by aggregation
			const groups = await collection.aggregate.groupBy.overAll({
				groupBy: { property: additionalOptions.groupBy },
			});

			return [
				{
					json: {
						collection: collectionName,
						groups,
						metadata: buildOperationMetadata('collection:aggregate', {
							collectionName,
							tenant: additionalOptions.tenant,
							groupBy: additionalOptions.groupBy,
						}),
					},
				},
			];
		} else {
			// Simple count aggregation
			const options: any = {};

			if (additionalOptions.limit) {
				options.objectLimit = additionalOptions.limit;
			}

			const result = await collection.aggregate.overAll(Object.keys(options).length > 0 ? options : undefined);

			return [
				{
					json: {
						collection: collectionName,
						totalCount: result.totalCount,
						properties: result.properties || undefined,
						metadata: buildOperationMetadata('collection:aggregate', {
							collectionName,
							tenant: additionalOptions.tenant,
						}),
					},
				},
			];
		}
	} finally {
		await client.close();
	}
}
