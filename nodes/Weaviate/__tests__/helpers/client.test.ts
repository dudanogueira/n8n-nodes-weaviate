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
	let originalEnv: NodeJS.ProcessEnv;

	beforeEach(() => {
		// Save and clear environment variables
		originalEnv = process.env;
		process.env = { ...originalEnv };
		// Clear all model provider API key environment variables
		delete process.env.OPENAI_APIKEY;
		delete process.env.COHERE_APIKEY;
		delete process.env.HUGGINGFACE_APIKEY;
		delete process.env.ANTHROPIC_APIKEY;
		delete process.env.ANTHROPIC_BASEURL;
		delete process.env.AWS_ACCESS_KEY;
		delete process.env.AWS_SECRET_KEY;
		delete process.env.VERTEX_APIKEY;
		delete process.env.GOOGLE_STUDIO_APIKEY;

		jest.clearAllMocks();
		mockConnectToCustom.mockResolvedValue(mockClient);

		mockGetCredentials = jest.fn();
		executeFunctions = {
			getCredentials: mockGetCredentials,
		} as unknown as IExecuteFunctions;
	});

	afterEach(() => {
		// Restore environment variables
		process.env = originalEnv;
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

		it('should include headers from environment variables', async () => {
			process.env.OPENAI_APIKEY = 'env-openai-key';
			process.env.COHERE_APIKEY = 'env-cohere-key';

			const credentials: WeaviateCredentials = {
				connection_type: 'weaviate_cloud',
				weaviate_cloud_endpoint: 'my-cluster.weaviate.network',
			};

			mockGetCredentials.mockResolvedValue(credentials);

			await getWeaviateClient.call(executeFunctions, 0);

			expect(mockConnectToCustom).toHaveBeenCalledWith(
				expect.objectContaining({
					headers: {
						'X-OpenAI-Api-Key': 'env-openai-key',
						'X-Cohere-Api-Key': 'env-cohere-key',
					},
				}),
			);
		});

		it('should allow custom headers to override environment variables', async () => {
			process.env.OPENAI_APIKEY = 'env-openai-key';

			const credentials: WeaviateCredentials = {
				connection_type: 'weaviate_cloud',
				weaviate_cloud_endpoint: 'my-cluster.weaviate.network',
				custom_headers_json: '{"X-OpenAI-Api-Key": "custom-openai-key"}',
			};

			mockGetCredentials.mockResolvedValue(credentials);

			await getWeaviateClient.call(executeFunctions, 0);

			expect(mockConnectToCustom).toHaveBeenCalledWith(
				expect.objectContaining({
					headers: {
						'X-OpenAI-Api-Key': 'custom-openai-key',
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
