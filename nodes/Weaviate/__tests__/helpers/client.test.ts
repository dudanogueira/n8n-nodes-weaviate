import type { IExecuteFunctions } from 'n8n-workflow';
import { getWeaviateClient } from '../../helpers/client';
import type { WeaviateCredentials } from '../../helpers/types';

// Mock weaviate-client - needs to be before imports
const mockConnectToCustom = jest.fn();
const mockClient = {
	collections: jest.fn(),
	backup: jest.fn(),
	close: jest.fn(),
};

jest.mock('weaviate-client', () => {
	return {
		__esModule: true,
		default: {
			connectToCustom: (...args: unknown[]) => mockConnectToCustom(...args),
		},
	};
});

describe('Weaviate Client Helper', () => {
	let executeFunctions: IExecuteFunctions;
	let mockGetCredentials: jest.Mock;

	beforeEach(() => {
		jest.clearAllMocks();
		mockConnectToCustom.mockResolvedValue(mockClient);

		mockGetCredentials = jest.fn();
		executeFunctions = {
			getCredentials: mockGetCredentials,
		} as unknown as IExecuteFunctions;
	});

	describe('Weaviate Cloud Connection', () => {
		it('should create cloud connection with API key', async () => {
			const credentials: WeaviateCredentials = {
				connection_type: 'weaviate_cloud',
				weaviate_cloud_endpoint: 'my-cluster.weaviate.network',
				weaviate_api_key: 'test-api-key-123',
			};

			mockGetCredentials.mockResolvedValue(credentials);

			await getWeaviateClient.call(executeFunctions, 0);

			expect(mockConnectToCustom).toHaveBeenCalledWith({
				httpHost: 'https://my-cluster.weaviate.network',
				httpPort: 443,
				httpSecure: true,
				grpcHost: 'https://my-cluster.weaviate.network',
				grpcPort: 443,
				grpcSecure: true,
				headers: {
					Authorization: 'Bearer test-api-key-123',
				},
			});
		});

		it('should create cloud connection without protocol in endpoint', async () => {
			const credentials: WeaviateCredentials = {
				connection_type: 'weaviate_cloud',
				weaviate_cloud_endpoint: 'my-cluster.weaviate.network',
			};

			mockGetCredentials.mockResolvedValue(credentials);

			await getWeaviateClient.call(executeFunctions, 0);

			expect(mockConnectToCustom).toHaveBeenCalledWith(
				expect.objectContaining({
					httpHost: 'https://my-cluster.weaviate.network',
					grpcHost: 'https://my-cluster.weaviate.network',
				}),
			);
		});

		it('should create cloud connection with https protocol already in endpoint', async () => {
			const credentials: WeaviateCredentials = {
				connection_type: 'weaviate_cloud',
				weaviate_cloud_endpoint: 'https://my-cluster.weaviate.network',
			};

			mockGetCredentials.mockResolvedValue(credentials);

			await getWeaviateClient.call(executeFunctions, 0);

			expect(mockConnectToCustom).toHaveBeenCalledWith(
				expect.objectContaining({
					httpHost: 'https://my-cluster.weaviate.network',
					grpcHost: 'https://my-cluster.weaviate.network',
				}),
			);
		});

		it('should create cloud connection with OpenAI credentials', async () => {
			const credentials: WeaviateCredentials = {
				connection_type: 'weaviate_cloud',
				weaviate_cloud_endpoint: 'my-cluster.weaviate.network',
				weaviate_api_key: 'test-api-key',
				openai_credential_name: 'openaiApi',
			};

			mockGetCredentials
				.mockResolvedValueOnce(credentials)
				.mockResolvedValueOnce({ apiKey: 'openai-key-123' });

			await getWeaviateClient.call(executeFunctions, 0);

			expect(mockGetCredentials).toHaveBeenCalledWith('weaviateApi', 0);
			expect(mockGetCredentials).toHaveBeenCalledWith('openaiApi');
			expect(mockConnectToCustom).toHaveBeenCalledWith(
				expect.objectContaining({
					headers: {
						Authorization: 'Bearer test-api-key',
						'X-OpenAI-Api-Key': 'openai-key-123',
					},
				}),
			);
		});

		it('should handle missing OpenAI credentials gracefully', async () => {
			const credentials: WeaviateCredentials = {
				connection_type: 'weaviate_cloud',
				weaviate_cloud_endpoint: 'my-cluster.weaviate.network',
				weaviate_api_key: 'test-api-key',
				openai_credential_name: 'openaiApi',
			};

			mockGetCredentials
				.mockResolvedValueOnce(credentials)
				.mockRejectedValueOnce(new Error('Credential not found'));

			await getWeaviateClient.call(executeFunctions, 0);

			expect(mockConnectToCustom).toHaveBeenCalledWith(
				expect.objectContaining({
					headers: {
						Authorization: 'Bearer test-api-key',
					},
				}),
			);
		});

		it('should apply custom headers from JSON string', async () => {
			const credentials: WeaviateCredentials = {
				connection_type: 'weaviate_cloud',
				weaviate_cloud_endpoint: 'my-cluster.weaviate.network',
				weaviate_api_key: 'test-api-key',
				custom_headers_json: '{"X-Custom-Header": "custom-value", "X-Another-Header": "another-value"}',
			};

			mockGetCredentials.mockResolvedValue(credentials);

			await getWeaviateClient.call(executeFunctions, 0);

			expect(mockConnectToCustom).toHaveBeenCalledWith(
				expect.objectContaining({
					headers: {
						Authorization: 'Bearer test-api-key',
						'X-Custom-Header': 'custom-value',
						'X-Another-Header': 'another-value',
					},
				}),
			);
		});

		it('should apply custom headers from object', async () => {
			const credentials: WeaviateCredentials = {
				connection_type: 'weaviate_cloud',
				weaviate_cloud_endpoint: 'my-cluster.weaviate.network',
				custom_headers_json: {
					'X-Custom-Header': 'custom-value',
				},
			};

			mockGetCredentials.mockResolvedValue(credentials);

			await getWeaviateClient.call(executeFunctions, 0);

			expect(mockConnectToCustom).toHaveBeenCalledWith(
				expect.objectContaining({
					headers: {
						'X-Custom-Header': 'custom-value',
					},
				}),
			);
		});

		it('should throw error for invalid JSON in custom headers', async () => {
			const credentials: WeaviateCredentials = {
				connection_type: 'weaviate_cloud',
				weaviate_cloud_endpoint: 'my-cluster.weaviate.network',
				custom_headers_json: '{invalid json}',
			};

			mockGetCredentials.mockResolvedValue(credentials);

			await expect(getWeaviateClient.call(executeFunctions, 0)).rejects.toThrow(
				'Invalid JSON in custom headers',
			);
		});

		it('should override default headers with custom headers', async () => {
			const credentials: WeaviateCredentials = {
				connection_type: 'weaviate_cloud',
				weaviate_cloud_endpoint: 'my-cluster.weaviate.network',
				weaviate_api_key: 'original-key',
				custom_headers_json: '{"Authorization": "Bearer overridden-key"}',
			};

			mockGetCredentials.mockResolvedValue(credentials);

			await getWeaviateClient.call(executeFunctions, 0);

			expect(mockConnectToCustom).toHaveBeenCalledWith(
				expect.objectContaining({
					headers: {
						Authorization: 'Bearer overridden-key',
					},
				}),
			);
		});
	});

	describe('Custom Connection', () => {
		it('should create custom connection with default values', async () => {
			const credentials: WeaviateCredentials = {
				connection_type: 'custom_connection',
			};

			mockGetCredentials.mockResolvedValue(credentials);

			await getWeaviateClient.call(executeFunctions, 0);

			expect(mockConnectToCustom).toHaveBeenCalledWith({
				httpHost: 'localhost',
				httpPort: 8080,
				httpSecure: false,
				grpcHost: 'localhost',
				grpcPort: 50051,
				grpcSecure: false,
				headers: {},
			});
		});

		it('should create custom connection with all custom values', async () => {
			const credentials: WeaviateCredentials = {
				connection_type: 'custom_connection',
				custom_connection_http_host: 'weaviate.example.com',
				custom_connection_http_port: 8443,
				custom_connection_http_secure: true,
				custom_connection_grpc_host: 'grpc.example.com',
				custom_connection_grpc_port: 50052,
				custom_connection_grpc_secure: true,
				weaviate_api_key: 'custom-api-key',
			};

			mockGetCredentials.mockResolvedValue(credentials);

			await getWeaviateClient.call(executeFunctions, 0);

			expect(mockConnectToCustom).toHaveBeenCalledWith({
				httpHost: 'weaviate.example.com',
				httpPort: 8443,
				httpSecure: true,
				grpcHost: 'grpc.example.com',
				grpcPort: 50052,
				grpcSecure: true,
				headers: {
					Authorization: 'Bearer custom-api-key',
				},
			});
		});

		it('should create custom connection with partial configuration', async () => {
			const credentials: WeaviateCredentials = {
				connection_type: 'custom_connection',
				custom_connection_http_host: 'custom-host',
				custom_connection_http_port: 9090,
			};

			mockGetCredentials.mockResolvedValue(credentials);

			await getWeaviateClient.call(executeFunctions, 0);

			expect(mockConnectToCustom).toHaveBeenCalledWith({
				httpHost: 'custom-host',
				httpPort: 9090,
				httpSecure: false,
				grpcHost: 'localhost',
				grpcPort: 50051,
				grpcSecure: false,
				headers: {},
			});
		});

		it('should create custom connection with OpenAI credentials', async () => {
			const credentials: WeaviateCredentials = {
				connection_type: 'custom_connection',
				custom_connection_http_host: 'localhost',
				openai_credential_name: 'openaiApi',
			};

			mockGetCredentials
				.mockResolvedValueOnce(credentials)
				.mockResolvedValueOnce({ apiKey: 'openai-custom-key' });

			await getWeaviateClient.call(executeFunctions, 0);

			expect(mockConnectToCustom).toHaveBeenCalledWith(
				expect.objectContaining({
					headers: {
						'X-OpenAI-Api-Key': 'openai-custom-key',
					},
				}),
			);
		});

		it('should create custom connection with custom headers', async () => {
			const credentials: WeaviateCredentials = {
				connection_type: 'custom_connection',
				custom_headers_json: '{"X-Custom": "value123"}',
			};

			mockGetCredentials.mockResolvedValue(credentials);

			await getWeaviateClient.call(executeFunctions, 0);

			expect(mockConnectToCustom).toHaveBeenCalledWith(
				expect.objectContaining({
					headers: {
						'X-Custom': 'value123',
					},
				}),
			);
		});
	});

	describe('Return Value', () => {
		it('should return the client instance', async () => {
			const credentials: WeaviateCredentials = {
				connection_type: 'weaviate_cloud',
				weaviate_cloud_endpoint: 'test.weaviate.network',
			};

			mockGetCredentials.mockResolvedValue(credentials);

			const client = await getWeaviateClient.call(executeFunctions, 0);

			expect(client).toBe(mockClient);
		});
	});
});
