import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { buildGenerativeConfig } from '../../operations/generate/config';
import * as nearTextGenerate from '../../operations/generate/nearText';
import * as nearVectorGenerate from '../../operations/generate/nearVector';
import * as nearObjectGenerate from '../../operations/generate/nearObject';
import * as nearImageGenerate from '../../operations/generate/nearImage';
import * as nearMediaGenerate from '../../operations/generate/nearMedia';
import * as bm25Generate from '../../operations/generate/bm25';
import * as hybridGenerate from '../../operations/generate/hybrid';
import { getWeaviateClient } from '../../helpers/client';

// Mock weaviate client
jest.mock('../../helpers/client', () => ({
	getWeaviateClient: jest.fn(),
}));

describe('Weaviate Generative Search Operations', () => {
	let mockExecuteFunctions: IExecuteFunctions;
	let mockGenerate: {
		nearText: jest.Mock;
		nearVector: jest.Mock;
		nearObject: jest.Mock;
		nearImage: jest.Mock;
		nearMedia: jest.Mock;
		bm25: jest.Mock;
		hybrid: jest.Mock;
	};
	let mockClient: {
		collections: {
			get: jest.Mock;
		};
		close: jest.Mock;
	};

	beforeEach(() => {
		mockGenerate = {
			nearText: jest.fn(),
			nearVector: jest.fn(),
			nearObject: jest.fn(),
			nearImage: jest.fn(),
			nearMedia: jest.fn(),
			bm25: jest.fn(),
			hybrid: jest.fn(),
		};

		mockClient = {
			collections: {
				get: jest.fn().mockReturnValue({
					generate: mockGenerate,
				}),
			},
			close: jest.fn(),
		};

		(getWeaviateClient as jest.Mock).mockResolvedValue(mockClient);

		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getNode: jest.fn().mockReturnValue({ name: 'Weaviate' }),
		} as unknown as IExecuteFunctions;
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('nearText with generation', () => {
		it('should perform generative nearText with singlePrompt', async () => {
			const mockGetNodeParameter = mockExecuteFunctions.getNodeParameter as jest.Mock;
			mockGetNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'collection':
						return 'Article';
					case 'queryText':
						return 'test query';
					case 'limit':
						return 10;
					case 'additionalOptions':
						return {};
					case 'generativeOptions':
						return {
							singlePrompt: 'Summarize: {title}',
							modelProvider: 'openai',
							openaiModel: 'gpt-4',
						};
					default:
						return undefined;
				}
			});

			mockGenerate.nearText.mockResolvedValue({
				objects: [
					{
						uuid: 'uuid-1',
						properties: { title: 'Test Article' },
						generative: {
							text: 'Generated summary',
							metadata: { model: 'gpt-4', tokens: 100 },
						},
						metadata: {},
					},
				],
			});

			const result = await nearTextGenerate.execute.call(mockExecuteFunctions, 0);

			expect(mockGenerate.nearText).toHaveBeenCalledWith(
				'test query',
				expect.objectContaining({
					singlePrompt: 'Summarize: {title}',
					config: expect.objectContaining({
						name: 'generative-openai',
					}),
				}),
				expect.objectContaining({ limit: 10 }),
			);
			expect(result).toHaveLength(1);
			expect(result[0].json.generated).toBe('Generated summary');
			expect((result[0].json.metadata as IDataObject).generativeMetadata).toBeDefined();
		});

		it('should perform generative nearText with groupedTask', async () => {
			const mockGetNodeParameter = mockExecuteFunctions.getNodeParameter as jest.Mock;
			mockGetNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'collection':
						return 'Article';
					case 'queryText':
						return 'test query';
					case 'limit':
						return 10;
					case 'additionalOptions':
						return {};
					case 'generativeOptions':
						return {
							groupedTask: 'What are the common themes?',
							modelProvider: 'anthropic',
							anthropicModel: 'claude-3-5-sonnet-20241022',
						};
					default:
						return undefined;
				}
			});

			mockGenerate.nearText.mockResolvedValue({
				objects: [
					{
						uuid: 'uuid-1',
						properties: { title: 'Test Article' },
						metadata: {},
					},
				],
			});

			const result = await nearTextGenerate.execute.call(mockExecuteFunctions, 0);

			expect(mockGenerate.nearText).toHaveBeenCalledWith(
				'test query',
				expect.objectContaining({
					groupedTask: 'What are the common themes?',
					config: expect.objectContaining({
						name: 'generative-anthropic',
					}),
				}),
				expect.objectContaining({ limit: 10 }),
			);
			expect(result).toHaveLength(1);
		});

		it('should throw error when no prompts provided', async () => {
			const mockGetNodeParameter = mockExecuteFunctions.getNodeParameter as jest.Mock;
			mockGetNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'collection':
						return 'Article';
					case 'queryText':
						return 'test query';
					case 'limit':
						return 10;
					case 'additionalOptions':
						return {};
					case 'generativeOptions':
						return {
							modelProvider: 'openai',
						};
					default:
						return undefined;
				}
			});

			await expect(nearTextGenerate.execute.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'At least one of "Single Prompt" or "Grouped Task" must be provided',
			);
		});
	});

	describe('nearVector with generation', () => {
		it('should perform generative nearVector with singlePrompt', async () => {
			const mockGetNodeParameter = mockExecuteFunctions.getNodeParameter as jest.Mock;
			mockGetNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'collection':
						return 'Article';
					case 'queryVector':
						return '[0.1, 0.2, 0.3]';
					case 'limit':
						return 10;
					case 'additionalOptions':
						return {};
					case 'generativeOptions':
						return {
							singlePrompt: 'Explain: {content}',
							modelProvider: 'cohere',
							cohereModel: 'command-r-plus',
						};
					default:
						return undefined;
				}
			});

			mockGenerate.nearVector.mockResolvedValue({
				objects: [
					{
						uuid: 'uuid-1',
						properties: { content: 'Test content' },
						generative: {
							text: 'Generated explanation',
						},
						metadata: {},
					},
				],
			});

			const result = await nearVectorGenerate.execute.call(mockExecuteFunctions, 0);

			expect(mockGenerate.nearVector).toHaveBeenCalledWith(
				[0.1, 0.2, 0.3],
				expect.objectContaining({
					singlePrompt: 'Explain: {content}',
					config: expect.objectContaining({
						name: 'generative-cohere',
					}),
				}),
				expect.objectContaining({ limit: 10 }),
			);
			expect(result).toHaveLength(1);
			expect(result[0].json.generated).toBe('Generated explanation');
		});
	});

	describe('nearObject with generation', () => {
		it('should perform generative nearObject with singlePrompt', async () => {
			const mockGetNodeParameter = mockExecuteFunctions.getNodeParameter as jest.Mock;
			mockGetNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'collection':
						return 'Article';
					case 'objectId':
						return '00000000-0000-0000-0000-000000000001';
					case 'limit':
						return 10;
					case 'additionalOptions':
						return {};
					case 'generativeOptions':
						return {
							singlePrompt: 'Summarize: {title}',
							modelProvider: 'google',
							googleModel: 'gemini-1.5-pro',
						};
					default:
						return undefined;
				}
			});

			mockGenerate.nearObject.mockResolvedValue({
				objects: [
					{
						uuid: 'uuid-1',
						properties: { title: 'Similar Article' },
						generative: {
							text: 'Generated summary',
						},
						metadata: {},
					},
				],
			});

			const result = await nearObjectGenerate.execute.call(mockExecuteFunctions, 0);

			expect(mockGenerate.nearObject).toHaveBeenCalledWith(
				'00000000-0000-0000-0000-000000000001',
				expect.objectContaining({
					singlePrompt: 'Summarize: {title}',
					config: expect.objectContaining({
						name: 'generative-google',
					}),
				}),
				expect.objectContaining({ limit: 10 }),
			);
			expect(result).toHaveLength(1);
		});
	});

	describe('nearImage with generation', () => {
		it('should perform generative nearImage with singlePrompt', async () => {
			const mockGetNodeParameter = mockExecuteFunctions.getNodeParameter as jest.Mock;
			mockGetNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'collection':
						return 'Image';
					case 'imageData':
						return 'base64EncodedImageData';
					case 'limit':
						return 10;
					case 'additionalOptions':
						return {};
					case 'generativeOptions':
						return {
							singlePrompt: 'Describe this image: {description}',
							modelProvider: 'mistral',
							mistralModel: 'mistral-large-latest',
						};
					default:
						return undefined;
				}
			});

			mockGenerate.nearImage.mockResolvedValue({
				objects: [
					{
						uuid: 'uuid-1',
						properties: { description: 'Image description' },
						generative: {
							text: 'Generated description',
						},
						metadata: {},
					},
				],
			});

			const result = await nearImageGenerate.execute.call(mockExecuteFunctions, 0);

			expect(mockGenerate.nearImage).toHaveBeenCalledWith(
				'base64EncodedImageData',
				expect.objectContaining({
					singlePrompt: 'Describe this image: {description}',
					config: expect.objectContaining({
						name: 'generative-mistral',
					}),
				}),
				expect.objectContaining({ limit: 10 }),
			);
			expect(result).toHaveLength(1);
		});
	});

	describe('nearMedia with generation', () => {
		it('should perform generative nearMedia with singlePrompt', async () => {
			const mockGetNodeParameter = mockExecuteFunctions.getNodeParameter as jest.Mock;
			mockGetNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'collection':
						return 'Media';
					case 'mediaData':
						return 'base64EncodedAudioData';
					case 'mediaType':
						return 'audio';
					case 'limit':
						return 10;
					case 'additionalOptions':
						return {};
					case 'generativeOptions':
						return {
							singlePrompt: 'Transcribe: {content}',
							modelProvider: 'ollama',
							ollamaModel: 'llama3',
						};
					default:
						return undefined;
				}
			});

			mockGenerate.nearMedia.mockResolvedValue({
				objects: [
					{
						uuid: 'uuid-1',
						properties: { content: 'Media content' },
						generative: {
							text: 'Generated transcription',
						},
						metadata: {},
					},
				],
			});

			const result = await nearMediaGenerate.execute.call(mockExecuteFunctions, 0);

			expect(mockGenerate.nearMedia).toHaveBeenCalledWith(
				'base64EncodedAudioData',
				'audio',
				expect.objectContaining({
					singlePrompt: 'Transcribe: {content}',
					config: expect.objectContaining({
						name: 'generative-ollama',
					}),
				}),
				expect.objectContaining({ limit: 10 }),
			);
			expect(result).toHaveLength(1);
		});
	});

	describe('bm25 with generation', () => {
		it('should perform generative BM25 with singlePrompt', async () => {
			const mockGetNodeParameter = mockExecuteFunctions.getNodeParameter as jest.Mock;
			mockGetNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'collection':
						return 'Article';
					case 'query':
						return 'test query';
					case 'limit':
						return 10;
					case 'additionalOptions':
						return {};
					case 'generativeOptions':
						return {
							singlePrompt: 'Summarize: {title}',
							modelProvider: 'aws',
							awsModel: 'anthropic.claude-3-sonnet-20240229-v1:0',
						};
					default:
						return undefined;
				}
			});

			mockGenerate.bm25.mockResolvedValue({
				objects: [
					{
						uuid: 'uuid-1',
						properties: { title: 'Test Article' },
						generative: {
							text: 'Generated summary',
						},
						metadata: {},
					},
				],
			});

			const result = await bm25Generate.execute.call(mockExecuteFunctions, 0);

			expect(mockGenerate.bm25).toHaveBeenCalledWith(
				'test query',
				expect.objectContaining({
					singlePrompt: 'Summarize: {title}',
					config: expect.objectContaining({
						name: 'generative-aws',
					}),
				}),
				expect.objectContaining({ limit: 10 }),
			);
			expect(result).toHaveLength(1);
		});
	});

	describe('hybrid with generation', () => {
		it('should perform generative hybrid with singlePrompt and alpha', async () => {
			const mockGetNodeParameter = mockExecuteFunctions.getNodeParameter as jest.Mock;
			mockGetNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'collection':
						return 'Article';
					case 'query':
						return 'test query';
					case 'limit':
						return 10;
					case 'additionalOptions':
						return { alpha: 0.7 };
					case 'generativeOptions':
						return {
							singlePrompt: 'Summarize: {title}',
							modelProvider: 'nvidia',
							nvidiaModel: 'nvidia/llama-3.1-nemotron-70b-instruct',
						};
					default:
						return undefined;
				}
			});

			mockGenerate.hybrid.mockResolvedValue({
				objects: [
					{
						uuid: 'uuid-1',
						properties: { title: 'Test Article' },
						generative: {
							text: 'Generated summary',
						},
						metadata: {},
					},
				],
			});

			const result = await hybridGenerate.execute.call(mockExecuteFunctions, 0);

			expect(mockGenerate.hybrid).toHaveBeenCalledWith(
				'test query',
				expect.objectContaining({
					singlePrompt: 'Summarize: {title}',
					config: expect.objectContaining({
						name: 'generative-nvidia',
					}),
				}),
				expect.objectContaining({
					limit: 10,
					alpha: 0.7,
				}),
			);
			expect(result).toHaveLength(1);
		});
	});

	describe('Provider configuration builders', () => {
		it('should build OpenAI config correctly', () => {
			const config = buildGenerativeConfig('openai', {
				openaiModel: 'gpt-4',
				openaiTemperature: 0.7,
				openaiMaxTokens: 1000,
			});

			expect(config).toEqual({
				name: 'generative-openai',
				config: {
					model: 'gpt-4',
					temperature: 0.7,
					maxTokens: 1000,
				},
			});
		});

		it('should build Azure OpenAI config correctly', () => {
			const config = buildGenerativeConfig('azureOpenai', {
				azureOpenaiModel: 'gpt-4',
				azureOpenaiResourceName: 'myresource',
				azureOpenaiDeploymentId: 'mydeployment',
				azureOpenaiTemperature: 0.7,
			});

			expect(config).toEqual({
				name: 'generative-azure-openai',
				config: {
					isAzure: true,
					model: 'gpt-4',
					resourceName: 'myresource',
					deploymentId: 'mydeployment',
					temperature: 0.7,
				},
			});
		});

		it('should build Anthropic config correctly', () => {
			const config = buildGenerativeConfig('anthropic', {
				anthropicModel: 'claude-3-5-sonnet-20241022',
				anthropicTemperature: 1.0,
				anthropicMaxTokens: 1024,
				anthropicTopK: 40,
			});

			expect(config).toEqual({
				name: 'generative-anthropic',
				config: {
					model: 'claude-3-5-sonnet-20241022',
					temperature: 1.0,
					maxTokens: 1024,
					topK: 40,
				},
			});
		});

		it('should build Cohere config correctly', () => {
			const config = buildGenerativeConfig('cohere', {
				cohereModel: 'command-r-plus',
				cohereTemperature: 0.7,
				cohereK: 50,
				cohereP: 0.75,
			});

			expect(config).toEqual({
				name: 'generative-cohere',
				config: {
					model: 'command-r-plus',
					temperature: 0.7,
					k: 50,
					p: 0.75,
				},
			});
		});

		it('should build Google config correctly', () => {
			const config = buildGenerativeConfig('google', {
				googleModel: 'gemini-1.5-pro',
				googleTemperature: 0.7,
				googleProjectId: 'my-project',
			});

			expect(config).toEqual({
				name: 'generative-google',
				config: {
					model: 'gemini-1.5-pro',
					temperature: 0.7,
					projectId: 'my-project',
				},
			});
		});

		it('should build AWS config correctly', () => {
			const config = buildGenerativeConfig('aws', {
				awsModel: 'anthropic.claude-3-sonnet-20240229-v1:0',
				awsService: 'bedrock',
				awsRegion: 'us-east-1',
				awsTemperature: 0.7,
			});

			expect(config).toEqual({
				name: 'generative-aws',
				config: {
					model: 'anthropic.claude-3-sonnet-20240229-v1:0',
					service: 'bedrock',
					region: 'us-east-1',
					temperature: 0.7,
				},
			});
		});

		it('should build Mistral config correctly', () => {
			const config = buildGenerativeConfig('mistral', {
				mistralModel: 'mistral-large-latest',
				mistralTemperature: 0.7,
				mistralMaxTokens: 1000,
			});

			expect(config).toEqual({
				name: 'generative-mistral',
				config: {
					model: 'mistral-large-latest',
					temperature: 0.7,
					maxTokens: 1000,
				},
			});
		});

		it('should build Anyscale config correctly', () => {
			const config = buildGenerativeConfig('anyscale', {
				anyscaleModel: 'meta-llama/Llama-3-70b-chat-hf',
				anyscaleTemperature: 0.7,
			});

			expect(config).toEqual({
				name: 'generative-anyscale',
				config: {
					model: 'meta-llama/Llama-3-70b-chat-hf',
					temperature: 0.7,
				},
			});
		});

		it('should build Ollama config correctly', () => {
			const config = buildGenerativeConfig('ollama', {
				ollamaModel: 'llama3',
				ollamaApiEndpoint: 'http://localhost:11434',
				ollamaTemperature: 0.7,
			});

			expect(config).toEqual({
				name: 'generative-ollama',
				config: {
					model: 'llama3',
					apiEndpoint: 'http://localhost:11434',
					temperature: 0.7,
				},
			});
		});

		it('should build NVIDIA config correctly', () => {
			const config = buildGenerativeConfig('nvidia', {
				nvidiaModel: 'nvidia/llama-3.1-nemotron-70b-instruct',
				nvidiaTemperature: 0.7,
				nvidiaMaxTokens: 1000,
			});

			expect(config).toEqual({
				name: 'generative-nvidia',
				config: {
					model: 'nvidia/llama-3.1-nemotron-70b-instruct',
					temperature: 0.7,
					maxTokens: 1000,
				},
			});
		});

		it('should build Databricks config correctly', () => {
			const config = buildGenerativeConfig('databricks', {
				databricksModel: 'my-model',
				databricksEndpoint: 'https://my-workspace.databricks.com',
				databricksTemperature: 0.7,
			});

			expect(config).toEqual({
				name: 'generative-databricks',
				config: {
					model: 'my-model',
					endpoint: 'https://my-workspace.databricks.com',
					temperature: 0.7,
				},
			});
		});

		it('should build FriendliAI config correctly', () => {
			const config = buildGenerativeConfig('friendliai', {
				friendliaiModel: 'meta-llama-3-70b-instruct',
				friendliaiTemperature: 0.7,
				friendliaiMaxTokens: 1000,
			});

			expect(config).toEqual({
				name: 'generative-friendliai',
				config: {
					model: 'meta-llama-3-70b-instruct',
					temperature: 0.7,
					maxTokens: 1000,
				},
			});
		});

		it('should build xAI config correctly', () => {
			const config = buildGenerativeConfig('xai', {
				xaiModel: 'grok-beta',
				xaiTemperature: 0.7,
				xaiMaxTokens: 1000,
			});

			expect(config).toEqual({
				name: 'generative-xai',
				config: {
					model: 'grok-beta',
					temperature: 0.7,
					maxTokens: 1000,
				},
			});
		});

		it('should build Contextual AI config correctly', () => {
			const config = buildGenerativeConfig('contextualai', {
				contextualaiModel: 'rohan',
				contextualaiTemperature: 0.7,
				contextualaiMaxNewTokens: 1000,
				contextualaiSystemPrompt: 'Be helpful',
			});

			expect(config).toEqual({
				name: 'generative-contextualai',
				config: {
					model: 'rohan',
					temperature: 0.7,
					maxNewTokens: 1000,
					systemPrompt: 'Be helpful',
				},
			});
		});

		it('should return undefined for unknown provider', () => {
			const config = buildGenerativeConfig('unknown', {});
			expect(config).toBeUndefined();
		});
	});

	describe('Advanced features', () => {
		it('should handle both singlePrompt and groupedTask together', async () => {
			const mockGetNodeParameter = mockExecuteFunctions.getNodeParameter as jest.Mock;
			mockGetNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'collection':
						return 'Article';
					case 'queryText':
						return 'test query';
					case 'limit':
						return 10;
					case 'additionalOptions':
						return {};
					case 'generativeOptions':
						return {
							singlePrompt: 'Summarize: {title}',
							groupedTask: 'What are common themes?',
							modelProvider: 'openai',
							openaiModel: 'gpt-4',
						};
					default:
						return undefined;
				}
			});

			mockGenerate.nearText.mockResolvedValue({
				objects: [
					{
						uuid: 'uuid-1',
						properties: { title: 'Test Article' },
						generative: {
							text: 'Individual summary',
						},
						metadata: {},
					},
				],
			});

			const result = await nearTextGenerate.execute.call(mockExecuteFunctions, 0);

			expect(mockGenerate.nearText).toHaveBeenCalledWith(
				'test query',
				expect.objectContaining({
					singlePrompt: 'Summarize: {title}',
					groupedTask: 'What are common themes?',
				}),
				expect.any(Object),
			);
			expect(result).toHaveLength(1);
		});

		it('should handle filters with generative search', async () => {
			const mockGetNodeParameter = mockExecuteFunctions.getNodeParameter as jest.Mock;
			mockGetNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'collection':
						return 'Article';
					case 'queryText':
						return 'test query';
					case 'limit':
						return 10;
					case 'additionalOptions':
						return {
							whereFilter: '{"path": ["status"], "operator": "Equal", "valueText": "published"}',
						};
					case 'generativeOptions':
						return {
							singlePrompt: 'Summarize: {title}',
							modelProvider: 'openai',
							openaiModel: 'gpt-4',
						};
					default:
						return undefined;
				}
			});

			mockGenerate.nearText.mockResolvedValue({
				objects: [],
			});

			await nearTextGenerate.execute.call(mockExecuteFunctions, 0);

			expect(mockGenerate.nearText).toHaveBeenCalledWith(
				'test query',
				expect.any(Object),
				expect.objectContaining({
					where: expect.objectContaining({
						path: ['status'],
						operator: 'Equal',
					}),
				}),
			);
		});
	});
});
