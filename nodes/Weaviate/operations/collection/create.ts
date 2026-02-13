import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { buildOperationMetadata, parseJsonSafe } from '../../helpers/utils';
import { makeWeaviateRestRequest } from '../../helpers/rest';

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const collectionConfigJson = this.getNodeParameter('collectionConfig', itemIndex) as string;

	// Parse the collection configuration JSON
	const collectionConfig = parseJsonSafe(collectionConfigJson, 'collectionConfig');

	// Create the collection using direct REST API call (POST /schema)
	await makeWeaviateRestRequest.call(this, itemIndex, {
		method: 'POST',
		path: '/schema',
		body: collectionConfig,
	});

	// Get the created collection config using direct REST API call (GET /schema/{className})
	const config = await makeWeaviateRestRequest.call(this, itemIndex, {
		method: 'GET',
		path: `/schema/${(collectionConfig as IDataObject).class}`,
	}) as IDataObject;

	return [
		{
			json: {
				success: true,
				collectionName: (collectionConfig as IDataObject).class,
				collection: config,
				metadata: buildOperationMetadata('collection:create', { collectionName: (collectionConfig as IDataObject).class }),
			},
		},
	];
}
