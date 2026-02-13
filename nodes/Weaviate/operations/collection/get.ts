import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { buildOperationMetadata } from '../../helpers/utils';
import { makeWeaviateRestRequest } from '../../helpers/rest';

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const collectionName = this.getNodeParameter('collectionName', itemIndex) as string;

	// Get collection config using direct REST API call (GET /schema/{className})
	const config = await makeWeaviateRestRequest.call(this, itemIndex, {
		method: 'GET',
		path: `/schema/${collectionName}`,
	});

	return [
		{
			json: {
				collectionName,
				config,
				metadata: buildOperationMetadata('collection:get', { collectionName }),
			},
		},
	];
}
