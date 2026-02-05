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
		includeVectors?: boolean;
	};

	const client = await getWeaviateClient.call(this, itemIndex);

	try {
		let collection = client.collections.get(collectionName);
		
		// If tenant is specified, use withTenant
		if (additionalOptions.tenant) {
			collection = collection.withTenant(additionalOptions.tenant);
		}

		const object = await collection.query.fetchObjectById(objectId, {
			includeVector: additionalOptions.includeVectors || false,
		});

		const result: IDataObject = {
			id: object?.uuid,
			collection: collectionName,
			properties: object?.properties,
			metadata: buildOperationMetadata('object:getById', { 
				collectionName, 
				objectId,
				tenant: additionalOptions.tenant 
			}),
		};

		// Only include vectors if requested
		if (additionalOptions.includeVectors && object?.vectors) {
			result.vectors = object.vectors;
		}

		return [
			{
				json: result,
			},
		];
	} finally {
		await client.close();
	}
}
