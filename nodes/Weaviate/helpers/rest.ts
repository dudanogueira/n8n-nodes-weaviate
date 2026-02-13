import type { IExecuteFunctions } from 'n8n-workflow';
import type { WeaviateCredentials } from './types';

export interface RestRequestOptions {
	method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
	path: string;
	body?: any;
}

export async function makeWeaviateRestRequest(
	this: IExecuteFunctions,
	itemIndex: number,
	options: RestRequestOptions,
): Promise<any> {
	const credentials = (await this.getCredentials('weaviateApi', itemIndex)) as WeaviateCredentials;

	// Build base URL
	let baseUrl: string;
	if (credentials.connection_type === 'weaviate_cloud') {
		let endpoint = credentials.weaviate_cloud_endpoint || '';
		if (!endpoint.startsWith('http://') && !endpoint.startsWith('https://')) {
			endpoint = `https://${endpoint}`;
		}
		baseUrl = endpoint;
	} else {
		const protocol = credentials.custom_connection_http_secure ? 'https' : 'http';
		const host = credentials.custom_connection_http_host || 'localhost';
		const port = credentials.custom_connection_http_port || 8080;
		baseUrl = `${protocol}://${host}:${port}`;
	}

	// Build headers
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
	};

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

	// Make the request
	const url = `${baseUrl}/v1${options.path}`;

	const requestOptions: RequestInit = {
		method: options.method,
		headers,
	};

	if (options.body) {
		requestOptions.body = JSON.stringify(options.body);
	}

	const response = await fetch(url, requestOptions);

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Weaviate REST API error (${response.status}): ${errorText}`);
	}

	// Handle empty responses
	const contentType = response.headers.get('content-type');
	if (contentType && contentType.includes('application/json')) {
		return await response.json();
	}

	return null;
}
