import type { INodeProperties } from 'n8n-workflow';
import { collectionField, limitField } from './common';

export const searchOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['search'],
			},
		},
		options: [
			{
				name: 'BM25',
				value: 'bm25',
				description: 'Keyword-based search using BM25 algorithm',
				action: 'Bm25 search',
			},
			{
				name: 'Hybrid',
				value: 'hybrid',
				description: 'Hybrid search combining keyword and vector search',
				action: 'Hybrid search',
			},
			{
				name: 'Near Image',
				value: 'nearImage',
				description: 'Find similar objects using image similarity search',
				action: 'Near image search',
			},
			{
				name: 'Near Media',
				value: 'nearMedia',
				description: 'Find similar objects using multi-modal media similarity search',
				action: 'Near media search',
			},
			{
				name: 'Near Object',
				value: 'nearObject',
				description: 'Find similar objects to an existing object by its UUID',
				action: 'Near object search',
			},
			{
				name: 'Near Text',
				value: 'nearText',
				description: 'Semantic search using text query',
				action: 'Near text search',
			},
			{
				name: 'Near Vector',
				value: 'nearVector',
				description: 'Vector similarity search using custom vector',
				action: 'Near vector search',
			},
		],
		default: 'nearText',
	},
];

export const searchFields: INodeProperties[] = [
	// Collection field for all operations
	{
		...collectionField,
		displayOptions: {
			show: {
				resource: ['search'],
			},
		},
	},

	// BM25 search fields
	{
		displayName: 'Query',
		name: 'query',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['search'],
				operation: ['bm25', 'hybrid'],
			},
		},
		default: '',
		placeholder: 'search query text',
		description: 'The keyword search query',
	},

	// Near Text search fields
	{
		displayName: 'Query Text',
		name: 'queryText',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['search'],
				operation: ['nearText'],
			},
		},
		default: '',
		placeholder: 'semantic search query',
		description: 'The text to search for semantically similar objects',
	},

	// Near Vector search fields
	{
		displayName: 'Query Vector',
		name: 'queryVector',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				resource: ['search'],
				operation: ['nearVector'],
			},
		},
		default: '',
		placeholder: '[0.1, 0.2, 0.3, ...]',
		description: 'The vector to search for similar objects',
	},

	// Near Image search fields
	{
		displayName: 'Image Data',
		name: 'imageData',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['search'],
				operation: ['nearImage'],
			},
		},
		default: '',
		placeholder: 'data:image/png;base64,iVBORw0KGgo... or base64 string',
		description: 'Base64 encoded image data (with or without data URI prefix)',
	},

	// Near Media search fields
	{
		displayName: 'Media Data',
		name: 'mediaData',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['search'],
				operation: ['nearMedia'],
			},
		},
		default: '',
		placeholder: 'Base64 encoded media data',
		description: 'Base64 encoded media data (audio, video, etc.)',
	},
	{
		displayName: 'Media Type',
		name: 'mediaType',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['search'],
				operation: ['nearMedia'],
			},
		},
		options: [
			{
				name: 'Audio',
				value: 'audio',
			},
			{
				name: 'Depth',
				value: 'depth',
			},
			{
				name: 'IMU',
				value: 'imu',
			},
			{
				name: 'Thermal',
				value: 'thermal',
			},
			{
				name: 'Video',
				value: 'video',
			},
		],
		default: 'audio',
		description: 'Type of media being searched',
	},

	// Near Object search fields
	{
		displayName: 'Object ID',
		name: 'objectId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['search'],
				operation: ['nearObject'],
			},
		},
		default: '',
		placeholder: 'e.g., 00000000-0000-0000-0000-000000000000',
		description: 'The UUID of the object to find similar objects to',
	},

	// Limit field for all searches
	{
		...limitField,
		displayOptions: {
			show: {
				resource: ['search'],
			},
		},
	},

	// Enable Generative toggle
	{
		displayName: 'Enable Generative',
		name: 'enableGenerative',
		type: 'boolean',
		default: false,
		description: 'Whether to enable retrieval-augmented generation (RAG) with LLM for search results',
		displayOptions: {
			show: {
				resource: ['search'],
			},
		},
	},

	// Generative Options collection
	{
		displayName: 'Generative Options',
		name: 'generativeOptions',
		type: 'collection',
		placeholder: 'Add Generation Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['search'],
				enableGenerative: [true],
			},
		},
		// eslint-disable-next-line n8n-nodes-base/node-param-collection-type-unsorted-items -- Logical grouping (provider selection -> provider configs -> prompts) is better UX than alphabetical
		options: [
			// Model Provider Selection (first, so users choose provider before configuring prompts)
			{
				displayName: 'Model Provider',
				name: 'modelProvider',
				type: 'options',
				default: 'openai',
				options: [
					{
						name: 'Anthropic',
						value: 'anthropic',
					},
					{
						name: 'Anyscale',
						value: 'anyscale',
					},
					{
						name: 'AWS Bedrock',
						value: 'aws',
					},
					{
						name: 'Azure OpenAI',
						value: 'azureOpenai',
					},
					{
						name: 'Cohere',
						value: 'cohere',
					},
					{
						name: 'Contextual AI',
						value: 'contextualai',
					},
					{
						name: 'Databricks',
						value: 'databricks',
					},
					{
						name: 'FriendliAI',
						value: 'friendliai',
					},
					{
						name: 'Google (Gemini/Vertex)',
						value: 'google',
					},
					{
						name: 'Mistral',
						value: 'mistral',
					},
					{
						name: 'NVIDIA',
						value: 'nvidia',
					},
					{
						name: 'Ollama',
						value: 'ollama',
					},
					{
						name: 'OpenAI',
						value: 'openai',
					},
					{
						name: 'xAI (Grok)',
						value: 'xai',
					},
				],
				description: 'The LLM provider to use for generation',
			},

			// OpenAI Configuration
			{
				displayName: 'Model',
				name: 'openaiModel',
				type: 'string',
				default: 'gpt-4',
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['openai'],
					},
				},
				description: 'OpenAI model to use (e.g., gpt-4, gpt-3.5-turbo, gpt-4-turbo)',
			},
			{
				displayName: 'Temperature',
				name: 'openaiTemperature',
				type: 'number',
				default: 0.7,
				typeOptions: {
					minValue: 0,
					maxValue: 2,
					numberPrecision: 2,
				},
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['openai'],
					},
				},
				description: 'Sampling temperature (0-2). Higher values make output more random.',
			},
			{
				displayName: 'Max Tokens',
				name: 'openaiMaxTokens',
				type: 'number',
				default: 1000,
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['openai'],
					},
				},
				description: 'Maximum number of tokens to generate',
			},
			{
				displayName: 'Frequency Penalty',
				name: 'openaiFrequencyPenalty',
				type: 'number',
				default: 0,
				typeOptions: {
					minValue: -2,
					maxValue: 2,
					numberPrecision: 2,
				},
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['openai'],
					},
				},
				description: 'Penalize new tokens based on their frequency in the text so far (-2 to 2)',
			},
			{
				displayName: 'Presence Penalty',
				name: 'openaiPresencePenalty',
				type: 'number',
				default: 0,
				typeOptions: {
					minValue: -2,
					maxValue: 2,
					numberPrecision: 2,
				},
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['openai'],
					},
				},
				description: 'Penalize new tokens based on whether they appear in the text so far (-2 to 2)',
			},
			{
				displayName: 'Top P',
				name: 'openaiTopP',
				type: 'number',
				default: 1,
				typeOptions: {
					minValue: 0,
					maxValue: 1,
					numberPrecision: 2,
				},
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['openai'],
					},
				},
				description: 'Nucleus sampling parameter (0-1). Consider only tokens with top_p probability mass.',
			},

			// Azure OpenAI Configuration
			{
				displayName: 'Model',
				name: 'azureOpenaiModel',
				type: 'string',
				default: 'gpt-4',
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['azureOpenai'],
					},
				},
				description: 'Azure OpenAI model deployment name',
			},
			{
				displayName: 'Resource Name',
				name: 'azureOpenaiResourceName',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['azureOpenai'],
					},
				},
				description: 'Azure OpenAI resource name',
			},
			{
				displayName: 'Deployment ID',
				name: 'azureOpenaiDeploymentId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['azureOpenai'],
					},
				},
				description: 'Azure OpenAI deployment ID',
			},
			{
				displayName: 'API Version',
				name: 'azureOpenaiApiVersion',
				type: 'string',
				default: '2024-02-01',
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['azureOpenai'],
					},
				},
				description: 'Azure OpenAI API version',
			},
			{
				displayName: 'Temperature',
				name: 'azureOpenaiTemperature',
				type: 'number',
				default: 0.7,
				typeOptions: {
					minValue: 0,
					maxValue: 2,
					numberPrecision: 2,
				},
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['azureOpenai'],
					},
				},
				description: 'Sampling temperature (0-2)',
			},
			{
				displayName: 'Max Tokens',
				name: 'azureOpenaiMaxTokens',
				type: 'number',
				default: 1000,
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['azureOpenai'],
					},
				},
				description: 'Maximum number of tokens to generate',
			},

			// Anthropic Configuration
			{
				displayName: 'Model',
				name: 'anthropicModel',
				type: 'options',
				default: 'claude-3-5-sonnet-20241022',
				options: [
					{
						name: 'Claude 3.5 Sonnet',
						value: 'claude-3-5-sonnet-20241022',
					},
					{
						name: 'Claude 3 Opus',
						value: 'claude-3-opus-20240229',
					},
					{
						name: 'Claude 3 Sonnet',
						value: 'claude-3-sonnet-20240229',
					},
					{
						name: 'Claude 3 Haiku',
						value: 'claude-3-haiku-20240307',
					},
				],
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['anthropic'],
					},
				},
				description: 'Anthropic Claude model to use',
			},
			{
				displayName: 'Temperature',
				name: 'anthropicTemperature',
				type: 'number',
				default: 1.0,
				typeOptions: {
					minValue: 0,
					maxValue: 1,
					numberPrecision: 2,
				},
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['anthropic'],
					},
				},
				description: 'Sampling temperature (0-1). Higher values make output more random.',
			},
			{
				displayName: 'Max Tokens',
				name: 'anthropicMaxTokens',
				type: 'number',
				default: 1024,
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['anthropic'],
					},
				},
				description: 'Maximum number of tokens to generate',
			},
			{
				displayName: 'Top K',
				name: 'anthropicTopK',
				type: 'number',
				default: 0,
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['anthropic'],
					},
				},
				description: 'Only sample from the top K options for each token',
			},
			{
				displayName: 'Top P',
				name: 'anthropicTopP',
				type: 'number',
				default: 1.0,
				typeOptions: {
					minValue: 0,
					maxValue: 1,
					numberPrecision: 2,
				},
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['anthropic'],
					},
				},
				description: 'Nucleus sampling parameter (0-1)',
			},

			// Cohere Configuration
			{
				displayName: 'Model',
				name: 'cohereModel',
				type: 'string',
				default: 'command-r-plus',
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['cohere'],
					},
				},
				description: 'Cohere model to use (e.g., command-r-plus, command-r, command)',
			},
			{
				displayName: 'Temperature',
				name: 'cohereTemperature',
				type: 'number',
				default: 0.7,
				typeOptions: {
					minValue: 0,
					maxValue: 2,
					numberPrecision: 2,
				},
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['cohere'],
					},
				},
				description: 'Sampling temperature (0-2)',
			},
			{
				displayName: 'Max Tokens',
				name: 'cohereMaxTokens',
				type: 'number',
				default: 1000,
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['cohere'],
					},
				},
				description: 'Maximum number of tokens to generate',
			},
			{
				displayName: 'K',
				name: 'cohereK',
				type: 'number',
				default: 0,
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['cohere'],
					},
				},
				description: 'Top-k sampling parameter',
			},
			{
				displayName: 'P',
				name: 'cohereP',
				type: 'number',
				default: 0.75,
				typeOptions: {
					minValue: 0,
					maxValue: 1,
					numberPrecision: 2,
				},
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['cohere'],
					},
				},
				description: 'Top-p (nucleus) sampling parameter (0-1)',
			},

			// Google Configuration
			{
				displayName: 'Model',
				name: 'googleModel',
				type: 'string',
				default: 'gemini-1.5-pro',
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['google'],
					},
				},
				description: 'Google model to use (e.g., gemini-1.5-pro, gemini-1.5-flash)',
			},
			{
				displayName: 'Temperature',
				name: 'googleTemperature',
				type: 'number',
				default: 0.7,
				typeOptions: {
					minValue: 0,
					maxValue: 2,
					numberPrecision: 2,
				},
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['google'],
					},
				},
				description: 'Sampling temperature (0-2)',
			},
			{
				displayName: 'Max Tokens',
				name: 'googleMaxTokens',
				type: 'number',
				default: 1000,
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['google'],
					},
				},
				description: 'Maximum number of tokens to generate',
			},
			{
				displayName: 'Project ID',
				name: 'googleProjectId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['google'],
					},
				},
				description: 'Google Cloud project ID (for Vertex AI)',
			},

			// AWS Bedrock Configuration
			{
				displayName: 'Model',
				name: 'awsModel',
				type: 'string',
				default: 'anthropic.claude-3-sonnet-20240229-v1:0',
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['aws'],
					},
				},
				description: 'AWS Bedrock model ID (e.g., anthropic.claude-3-sonnet-20240229-v1:0)',
			},
			{
				displayName: 'Service',
				name: 'awsService',
				type: 'string',
				default: 'bedrock',
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['aws'],
					},
				},
				description: 'AWS service name (usually "bedrock")',
			},
			{
				displayName: 'Region',
				name: 'awsRegion',
				type: 'string',
				default: 'us-east-1',
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['aws'],
					},
				},
				description: 'AWS region where Bedrock is deployed',
			},
			{
				displayName: 'Temperature',
				name: 'awsTemperature',
				type: 'number',
				default: 0.7,
				typeOptions: {
					minValue: 0,
					maxValue: 1,
					numberPrecision: 2,
				},
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['aws'],
					},
				},
				description: 'Sampling temperature (0-1)',
			},

			// Mistral Configuration
			{
				displayName: 'Model',
				name: 'mistralModel',
				type: 'string',
				default: 'mistral-large-latest',
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['mistral'],
					},
				},
				description: 'Mistral model to use (e.g., mistral-large-latest, mistral-medium)',
			},
			{
				displayName: 'Temperature',
				name: 'mistralTemperature',
				type: 'number',
				default: 0.7,
				typeOptions: {
					minValue: 0,
					maxValue: 2,
					numberPrecision: 2,
				},
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['mistral'],
					},
				},
				description: 'Sampling temperature (0-2)',
			},
			{
				displayName: 'Max Tokens',
				name: 'mistralMaxTokens',
				type: 'number',
				default: 1000,
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['mistral'],
					},
				},
				description: 'Maximum number of tokens to generate',
			},

			// Anyscale Configuration
			{
				displayName: 'Model',
				name: 'anyscaleModel',
				type: 'string',
				default: 'meta-llama/Llama-3-70b-chat-hf',
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['anyscale'],
					},
				},
				description: 'Anyscale model to use (Llama models)',
			},
			{
				displayName: 'Temperature',
				name: 'anyscaleTemperature',
				type: 'number',
				default: 0.7,
				typeOptions: {
					minValue: 0,
					maxValue: 2,
					numberPrecision: 2,
				},
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['anyscale'],
					},
				},
				description: 'Sampling temperature (0-2)',
			},

			// Ollama Configuration
			{
				displayName: 'Model',
				name: 'ollamaModel',
				type: 'string',
				default: 'llama3',
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['ollama'],
					},
				},
				description: 'Ollama model to use (e.g., llama3, mistral, codellama)',
			},
			{
				displayName: 'API Endpoint',
				name: 'ollamaApiEndpoint',
				type: 'string',
				default: 'http://localhost:11434',
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['ollama'],
					},
				},
				description: 'Ollama API endpoint URL',
			},
			{
				displayName: 'Temperature',
				name: 'ollamaTemperature',
				type: 'number',
				default: 0.7,
				typeOptions: {
					minValue: 0,
					maxValue: 2,
					numberPrecision: 2,
				},
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['ollama'],
					},
				},
				description: 'Sampling temperature (0-2)',
			},

			// NVIDIA Configuration
			{
				displayName: 'Model',
				name: 'nvidiaModel',
				type: 'string',
				default: 'nvidia/llama-3.1-nemotron-70b-instruct',
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['nvidia'],
					},
				},
				description: 'NVIDIA NIM model to use',
			},
			{
				displayName: 'Temperature',
				name: 'nvidiaTemperature',
				type: 'number',
				default: 0.7,
				typeOptions: {
					minValue: 0,
					maxValue: 2,
					numberPrecision: 2,
				},
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['nvidia'],
					},
				},
				description: 'Sampling temperature (0-2)',
			},
			{
				displayName: 'Max Tokens',
				name: 'nvidiaMaxTokens',
				type: 'number',
				default: 1000,
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['nvidia'],
					},
				},
				description: 'Maximum number of tokens to generate',
			},

			// Databricks Configuration
			{
				displayName: 'Model',
				name: 'databricksModel',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['databricks'],
					},
				},
				description: 'Databricks model serving endpoint name',
			},
			{
				displayName: 'Endpoint',
				name: 'databricksEndpoint',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['databricks'],
					},
				},
				description: 'Databricks workspace URL',
			},
			{
				displayName: 'Temperature',
				name: 'databricksTemperature',
				type: 'number',
				default: 0.7,
				typeOptions: {
					minValue: 0,
					maxValue: 2,
					numberPrecision: 2,
				},
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['databricks'],
					},
				},
				description: 'Sampling temperature (0-2)',
			},
			{
				displayName: 'Max Tokens',
				name: 'databricksMaxTokens',
				type: 'number',
				default: 1000,
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['databricks'],
					},
				},
				description: 'Maximum number of tokens to generate',
			},

			// FriendliAI Configuration
			{
				displayName: 'Model',
				name: 'friendliaiModel',
				type: 'string',
				default: 'meta-llama-3-70b-instruct',
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['friendliai'],
					},
				},
				description: 'FriendliAI model to use',
			},
			{
				displayName: 'Temperature',
				name: 'friendliaiTemperature',
				type: 'number',
				default: 0.7,
				typeOptions: {
					minValue: 0,
					maxValue: 2,
					numberPrecision: 2,
				},
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['friendliai'],
					},
				},
				description: 'Sampling temperature (0-2)',
			},
			{
				displayName: 'Max Tokens',
				name: 'friendliaiMaxTokens',
				type: 'number',
				default: 1000,
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['friendliai'],
					},
				},
				description: 'Maximum number of tokens to generate',
			},

			// xAI Configuration
			{
				displayName: 'Model',
				name: 'xaiModel',
				type: 'string',
				default: 'grok-beta',
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['xai'],
					},
				},
				description: 'XAI model to use (Grok models)',
			},
			{
				displayName: 'Temperature',
				name: 'xaiTemperature',
				type: 'number',
				default: 0.7,
				typeOptions: {
					minValue: 0,
					maxValue: 2,
					numberPrecision: 2,
				},
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['xai'],
					},
				},
				description: 'Sampling temperature (0-2)',
			},
			{
				displayName: 'Max Tokens',
				name: 'xaiMaxTokens',
				type: 'number',
				default: 1000,
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['xai'],
					},
				},
				description: 'Maximum number of tokens to generate',
			},

			// Contextual AI Configuration
			{
				displayName: 'Model',
				name: 'contextualaiModel',
				type: 'string',
				default: 'rohan',
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['contextualai'],
					},
				},
				description: 'Contextual AI model to use',
			},
			{
				displayName: 'Temperature',
				name: 'contextualaiTemperature',
				type: 'number',
				default: 0.7,
				typeOptions: {
					minValue: 0,
					maxValue: 1,
					numberPrecision: 2,
				},
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['contextualai'],
					},
				},
				description: 'Sampling temperature (0-1)',
			},
			{
				displayName: 'Max New Tokens',
				name: 'contextualaiMaxNewTokens',
				type: 'number',
				default: 1000,
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['contextualai'],
					},
				},
				description: 'Maximum number of new tokens to generate',
			},
			{
				displayName: 'System Prompt',
				name: 'contextualaiSystemPrompt',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['contextualai'],
					},
				},
				description: 'System prompt to guide the model behavior',
			},
			{
				displayName: 'Avoid Commentary',
				name: 'contextualaiAvoidCommentary',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						'/generativeOptions.modelProvider': ['contextualai'],
					},
				},
				description: 'Whether to avoid generating commentary',
			},

			// Prompt Configuration (at the end, after provider selection and configuration)
			{
				displayName: 'Single Prompt',
				name: 'singlePrompt',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				placeholder: 'Summarize this document: {title} {content}',
				description: 'Prompt to generate content for each individual result. Use {propertyName} to reference properties. At least one of Single Prompt or Grouped Task is required.',
			},
			{
				displayName: 'Grouped Task',
				name: 'groupedTask',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				placeholder: 'What are the common themes across all results?',
				description: 'Prompt to generate content based on all results combined. At least one of Single Prompt or Grouped Task is required.',
			},
		],
	},

	// Additional options for all search operations
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['search'],
			},
		},
		options: [
			{
				displayName: 'Alpha',
				name: 'alpha',
				type: 'number',
				default: 0.5,
				typeOptions: {
					minValue: 0,
					maxValue: 1,
					numberPrecision: 2,
				},
				description: 'Weighting factor for hybrid search (0=BM25 only, 1=vector only)',
				displayOptions: {
					show: {
						'/operation': ['hybrid'],
					},
				},
			},
			{
				displayName: 'Autocut',
				name: 'autocut',
				type: 'number',
				default: 0,
				description: 'Enable autocut to dynamically limit results. Set to 1 or higher to enable.',
			},
			{
				displayName: 'Certainty',
				name: 'certainty',
				type: 'number',
				default: 0,
				typeOptions: {
					minValue: 0,
					maxValue: 1,
					numberPrecision: 2,
				},
				description: 'Minimum certainty threshold for results (0-1)',
				displayOptions: {
					show: {
						'/operation': ['nearText', 'nearVector', 'nearObject', 'nearImage', 'nearMedia'],
					},
				},
			},
			{
				displayName: 'Distance',
				name: 'distance',
				type: 'number',
				default: 0,
				description: 'Maximum distance threshold for results',
				displayOptions: {
					show: {
						'/operation': ['nearText', 'nearVector', 'nearObject', 'nearImage', 'nearMedia'],
					},
				},
			},
			{
				displayName: 'Filters',
				name: 'whereFilter',
				type: 'json',
				default: '',
				placeholder: '{"path": ["status"], "operator": "Equal", "valueText": "published"}',
				description: 'Filter to apply to search results. See <a href="https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.vectorstoreweaviate/#search-filters" target="_blank">filter documentation</a>.',
			},
			{
				displayName: 'Include Vector',
				name: 'includeVector',
				type: 'boolean',
				default: false,
				description: 'Whether to include the vector in the results',
			},
			{
				displayName: 'Move Away',
				name: 'moveAway',
				type: 'json',
				default: '',
				placeholder: '{"concepts": ["feline"], "force": 0.6}',
				description: 'Move results away from these concepts. Example: <code>{"concepts": ["feline"], "force": 0.6}</code>',
				displayOptions: {
					show: {
						'/operation': ['nearText'],
					},
				},
			},
			{
				displayName: 'Move Towards',
				name: 'moveTowards',
				type: 'json',
				default: '',
				placeholder: '{"concepts": ["canine"], "force": 0.8}',
				description: 'Move results towards these concepts. Example: <code>{"concepts": ["canine"], "force": 0.8}</code>',
				displayOptions: {
					show: {
						'/operation': ['nearText'],
					},
				},
			},
			{
				displayName: 'Offset',
				name: 'offset',
				type: 'number',
				default: 0,
				description: 'Number of results to skip',
			},
			{
				displayName: 'Rerank',
				name: 'rerank',
				type: 'json',
				default: '',
				placeholder: '{"property": "text", "query": "most relevant results"}',
				description: 'Rerank results using a reranker. Example: <code>{"property": "text", "query": "most relevant results"}</code>',
			},
			{
				displayName: 'Return Creation Time',
				name: 'returnCreationTime',
				type: 'boolean',
				default: false,
				description: 'Whether to return the creation timestamp in the results',
			},
			{
				displayName: 'Return Distance',
				name: 'returnDistance',
				type: 'boolean',
				default: false,
				description: 'Whether to return the distance metric in the results',
				displayOptions: {
					show: {
						'/operation': ['nearText', 'nearVector', 'nearObject', 'nearImage', 'nearMedia'],
					},
				},
			},
			{
				displayName: 'Return Explain Score',
				name: 'returnExplainScore',
				type: 'boolean',
				default: false,
				description: 'Whether to return the explanation of the score in the results',
				displayOptions: {
					show: {
						'/operation': ['hybrid'],
					},
				},
			},
			{
				displayName: 'Return Format',
				name: 'returnFormat',
				type: 'options',
				default: 'perObject',
				options: [
					{
						name: 'Each Object Per Item',
						value: 'perObject',
					},
					{
						name: 'All Objects in Single Item',
						value: 'singleItem',
					},
				],
				description: 'How to format the returned results. "Each Object Per Item" returns one n8n item per object. "All Objects in Single Item" returns the entire result set as one item with objects array and generative fields.',
			},
			{
				displayName: 'Return Properties',
				name: 'returnProperties',
				type: 'string',
				default: '',
				placeholder: 'title, content, author',
				description: 'Comma-separated list of properties to return. Leave empty to return all.',
			},
			{
				displayName: 'Return Score',
				name: 'returnScore',
				type: 'boolean',
				default: false,
				description: 'Whether to return the score metric in the results',
				displayOptions: {
					show: {
						'/operation': ['bm25', 'hybrid'],
					},
				},
			},
			{
				displayName: 'Target Vector',
				name: 'targetVector',
				type: 'string',
				default: '',
				placeholder: 'vectorName',
				description: 'Target vector name for named vectors in multi-vector collections',
				displayOptions: {
					show: {
						'/operation': ['nearText', 'nearVector', 'nearObject', 'nearImage', 'nearMedia', 'hybrid'],
					},
				},
			},
			{
				displayName: 'Tenant',
				name: 'tenant',
				type: 'string',
				default: '',
				placeholder: 'tenant-name',
				description: 'Tenant name for multi-tenancy support',
			},
		],
	},
];
