import type { IExecuteFunctions } from 'n8n-workflow';
import weaviate, { type WeaviateClient } from 'weaviate-client';
import type { WeaviateCredentials } from './types';
import packageJson from '../../../package.json';

export async function getWeaviateClient(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<WeaviateClient> {
	const credentials = (await this.getCredentials('weaviateApi', itemIndex)) as WeaviateCredentials;

	// Build connection config based on connection type
	const headers: Record<string, string> = {};

	// Add custom client identification header
	const n8nNodesVersion = packageJson.version;
	// Get weaviate-client version from devDependencies
	const weaviateClientVersion = (packageJson as { devDependencies?: { 'weaviate-client'?: string } }).devDependencies?.['weaviate-client']?.replace('^', '') || 'unknown';
	headers['X-Weaviate-Client'] = `weaviate-client-typescript/${weaviateClientVersion}#n8n-nodes-weaviate@${n8nNodesVersion}`;

	/**
	 * Automatically map environment variables to HTTP headers for model providers.
	 *
	 * This allows you to set API keys via environment variables instead of storing them in credentials.
	 * The environment variables will be automatically added as headers when creating the Weaviate client.
	 *
	 * Example usage:
	 *   export OPENAI_APIKEY="sk-..."
	 *   export COHERE_APIKEY="..."
	 *   export ANTHROPIC_APIKEY="..."
	 *
	 * Documentation: https://docs.weaviate.io/weaviate/model-providers
	 *
	 * Priority order (lowest to highest):
	 *   1. Environment variables (this mapping)
	 *   2. Weaviate API key credential
	 *   3. Custom headers JSON (overrides all)
	 *
	 * Note: Can be disabled by setting "read_env_vars_for_headers" to false in credentials
	 */
	const envVarToHeaderMapping: Record<string, string> = {
		// OpenAI
		OPENAI_APIKEY: 'X-OpenAI-Api-Key',
		// Cohere
		COHERE_APIKEY: 'X-Cohere-Api-Key',
		// HuggingFace
		HUGGINGFACE_APIKEY: 'X-HuggingFace-Api-Key',
		// Anthropic
		ANTHROPIC_APIKEY: 'X-Anthropic-Api-Key',
		ANTHROPIC_BASEURL: 'X-Anthropic-Baseurl',
		// AWS
		AWS_ACCESS_KEY: 'X-AWS-Access-Key',
		AWS_SECRET_KEY: 'X-AWS-Secret-Key',
		// Google Vertex AI
		VERTEX_APIKEY: 'X-Vertex-Api-Key',
		// Google Gemini API
		GOOGLE_STUDIO_APIKEY: 'X-Studio-Api-Key',
	};

	// Check for API keys from environment variables (enabled by default)
	if (credentials.read_env_vars_for_headers !== false) {
		for (const [envVar, headerName] of Object.entries(envVarToHeaderMapping)) {
			if (process.env[envVar]) {
				headers[headerName] = process.env[envVar] as string;
			}
		}
	}

	// Add Weaviate API key if provided
	if (credentials.weaviate_api_key) {
		headers.Authorization = `Bearer ${credentials.weaviate_api_key}`;
	}

	// Process custom headers JSON - these override everything above
	if (credentials.custom_headers_json) {
		try {
			let customHeaders: Record<string, string>;
			
			if (typeof credentials.custom_headers_json === 'string') {
				customHeaders = JSON.parse(credentials.custom_headers_json);
			} else {
				customHeaders = credentials.custom_headers_json as Record<string, string>;
			}
			
			Object.assign(headers, customHeaders);
		} catch (error) {
			throw new Error(`Invalid JSON in custom headers: ${(error as Error).message}`);
		}
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
