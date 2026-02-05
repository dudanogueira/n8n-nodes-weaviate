import type { IExecuteFunctions } from 'n8n-workflow';
import weaviate, { type WeaviateClient } from 'weaviate-client';
import type { WeaviateCredentials } from './types';

export async function getWeaviateClient(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<WeaviateClient> {
	const credentials = (await this.getCredentials('weaviateApi', itemIndex)) as WeaviateCredentials;

	// Build connection config based on connection type
	const headers: Record<string, string> = {};

	// Add API key if provided
	if (credentials.weaviate_api_key) {
		headers.Authorization = `Bearer ${credentials.weaviate_api_key}`;
	}

	let client: WeaviateClient;

	if (credentials.connection_type === 'weaviate_cloud') {
		// Cloud connection - use URL directly without parsing
		let endpoint = credentials.weaviate_cloud_endpoint || '';

		// Ensure endpoint has protocol
		if (!endpoint.startsWith('http://') && !endpoint.startsWith('https://')) {
			endpoint = `https://${endpoint}`;
		}

		client = await weaviate.connectToCustom({
			httpHost: endpoint,
			httpPort: 443,
			httpSecure: true,
			grpcHost: endpoint,
			grpcPort: 443,
			grpcSecure: true,
			headers,
		});
	} else {
		// Custom connection
		client = await weaviate.connectToCustom({
			httpHost: credentials.custom_connection_http_host || 'localhost',
			httpPort: credentials.custom_connection_http_port || 8080,
			httpSecure: credentials.custom_connection_http_secure || false,
			grpcHost: credentials.custom_connection_grpc_host || 'localhost',
			grpcPort: credentials.custom_connection_grpc_port || 50051,
			grpcSecure: credentials.custom_connection_grpc_secure || false,
			headers,
		});
	}

	return client;
}
