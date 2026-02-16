import type { GenerativeConfigRuntime } from 'weaviate-client';
import type { IDataObject } from 'n8n-workflow';

/**
 * Build generative configuration for runtime model definition
 * @param provider The model provider name
 * @param options The options from n8n node parameters
 * @returns GenerativeConfigRuntime object or undefined
 */
export function buildGenerativeConfig(
	provider: string,
	options: IDataObject,
): GenerativeConfigRuntime | undefined {
	switch (provider) {
		case 'openai':
			return {
				name: 'generative-openai',
				config: {
					...(options.openaiModel && { model: options.openaiModel as string }),
					...(options.openaiTemperature !== undefined && {
						temperature: options.openaiTemperature as number,
					}),
					...(options.openaiMaxTokens && { maxTokens: options.openaiMaxTokens as number }),
					...(options.openaiFrequencyPenalty !== undefined && {
						frequencyPenalty: options.openaiFrequencyPenalty as number,
					}),
					...(options.openaiPresencePenalty !== undefined && {
						presencePenalty: options.openaiPresencePenalty as number,
					}),
					...(options.openaiTopP !== undefined && { topP: options.openaiTopP as number }),
					...(options.openaiN && { n: options.openaiN as number }),
					...(options.openaiStop && { stop: { values: (options.openaiStop as string).split(',').map((s) => s.trim()) } }),
					...(options.openaiBaseURL && { baseURL: options.openaiBaseURL as string }),
				},
			};

		case 'azureOpenai':
			return {
				name: 'generative-azure-openai',
				config: {
					isAzure: true,
					...(options.azureOpenaiModel && { model: options.azureOpenaiModel as string }),
					...(options.azureOpenaiResourceName && { resourceName: options.azureOpenaiResourceName as string }),
					...(options.azureOpenaiDeploymentId && { deploymentId: options.azureOpenaiDeploymentId as string }),
					...(options.azureOpenaiApiVersion && { apiVersion: options.azureOpenaiApiVersion as string }),
					...(options.azureOpenaiBaseURL && { baseURL: options.azureOpenaiBaseURL as string }),
					...(options.azureOpenaiTemperature !== undefined && {
						temperature: options.azureOpenaiTemperature as number,
					}),
					...(options.azureOpenaiMaxTokens && { maxTokens: options.azureOpenaiMaxTokens as number }),
					...(options.azureOpenaiFrequencyPenalty !== undefined && {
						frequencyPenalty: options.azureOpenaiFrequencyPenalty as number,
					}),
					...(options.azureOpenaiPresencePenalty !== undefined && {
						presencePenalty: options.azureOpenaiPresencePenalty as number,
					}),
					...(options.azureOpenaiTopP !== undefined && { topP: options.azureOpenaiTopP as number }),
				},
			};

		case 'anthropic':
			return {
				name: 'generative-anthropic',
				config: {
					...(options.anthropicModel && { model: options.anthropicModel as string }),
					...(options.anthropicTemperature !== undefined && {
						temperature: options.anthropicTemperature as number,
					}),
					...(options.anthropicMaxTokens && { maxTokens: options.anthropicMaxTokens as number }),
					...(options.anthropicTopK && { topK: options.anthropicTopK as number }),
					...(options.anthropicTopP !== undefined && { topP: options.anthropicTopP as number }),
					...(options.anthropicStopSequences && {
						stopSequences: { values: (options.anthropicStopSequences as string).split(',').map((s) => s.trim()) },
					}),
					...(options.anthropicBaseURL && { baseURL: options.anthropicBaseURL as string }),
				},
			};

		case 'cohere':
			return {
				name: 'generative-cohere',
				config: {
					...(options.cohereModel && { model: options.cohereModel as string }),
					...(options.cohereTemperature !== undefined && {
						temperature: options.cohereTemperature as number,
					}),
					...(options.cohereMaxTokens && { maxTokens: options.cohereMaxTokens as number }),
					...(options.cohereK && { k: options.cohereK as number }),
					...(options.cohereP !== undefined && { p: options.cohereP as number }),
					...(options.cohereFrequencyPenalty !== undefined && {
						frequencyPenalty: options.cohereFrequencyPenalty as number,
					}),
					...(options.coherePresencePenalty !== undefined && {
						presencePenalty: options.coherePresencePenalty as number,
					}),
					...(options.cohereStopSequences && {
						stopSequences: { values: (options.cohereStopSequences as string).split(',').map((s) => s.trim()) },
					}),
					...(options.cohereBaseURL && { baseURL: options.cohereBaseURL as string }),
				},
			};

		case 'google':
			return {
				name: 'generative-google',
				config: {
					...(options.googleModel && { model: options.googleModel as string }),
					...(options.googleTemperature !== undefined && {
						temperature: options.googleTemperature as number,
					}),
					...(options.googleMaxTokens && { maxTokens: options.googleMaxTokens as number }),
					...(options.googleTopK && { topK: options.googleTopK as number }),
					...(options.googleTopP !== undefined && { topP: options.googleTopP as number }),
					...(options.googleFrequencyPenalty !== undefined && {
						frequencyPenalty: options.googleFrequencyPenalty as number,
					}),
					...(options.googlePresencePenalty !== undefined && {
						presencePenalty: options.googlePresencePenalty as number,
					}),
					...(options.googleStopSequences && {
						stopSequences: { values: (options.googleStopSequences as string).split(',').map((s) => s.trim()) },
					}),
					...(options.googleApiEndpoint && { apiEndpoint: options.googleApiEndpoint as string }),
					...(options.googleProjectId && { projectId: options.googleProjectId as string }),
					...(options.googleEndpointId && { endpointId: options.googleEndpointId as string }),
					...(options.googleRegion && { region: options.googleRegion as string }),
				},
			};

		case 'aws':
			return {
				name: 'generative-aws',
				config: {
					...(options.awsModel && { model: options.awsModel as string }),
					...(options.awsTemperature !== undefined && { temperature: options.awsTemperature as number }),
					...(options.awsService && { service: options.awsService as string }),
					...(options.awsRegion && { region: options.awsRegion as string }),
					...(options.awsEndpoint && { endpoint: options.awsEndpoint as string }),
					...(options.awsTargetModel && { targetModel: options.awsTargetModel as string }),
					...(options.awsTargetVariant && { targetVariant: options.awsTargetVariant as string }),
				},
			};

		case 'mistral':
			return {
				name: 'generative-mistral',
				config: {
					...(options.mistralModel && { model: options.mistralModel as string }),
					...(options.mistralTemperature !== undefined && {
						temperature: options.mistralTemperature as number,
					}),
					...(options.mistralMaxTokens && { maxTokens: options.mistralMaxTokens as number }),
					...(options.mistralTopP !== undefined && { topP: options.mistralTopP as number }),
					...(options.mistralBaseURL && { baseURL: options.mistralBaseURL as string }),
				},
			};

		case 'anyscale':
			return {
				name: 'generative-anyscale',
				config: {
					...(options.anyscaleModel && { model: options.anyscaleModel as string }),
					...(options.anyscaleTemperature !== undefined && {
						temperature: options.anyscaleTemperature as number,
					}),
					...(options.anyscaleBaseURL && { baseURL: options.anyscaleBaseURL as string }),
				},
			};

		case 'ollama':
			return {
				name: 'generative-ollama',
				config: {
					...(options.ollamaModel && { model: options.ollamaModel as string }),
					...(options.ollamaTemperature !== undefined && {
						temperature: options.ollamaTemperature as number,
					}),
					...(options.ollamaApiEndpoint && { apiEndpoint: options.ollamaApiEndpoint as string }),
				},
			};

		case 'nvidia':
			return {
				name: 'generative-nvidia',
				config: {
					...(options.nvidiaModel && { model: options.nvidiaModel as string }),
					...(options.nvidiaTemperature !== undefined && {
						temperature: options.nvidiaTemperature as number,
					}),
					...(options.nvidiaMaxTokens && { maxTokens: options.nvidiaMaxTokens as number }),
					...(options.nvidiaTopP !== undefined && { topP: options.nvidiaTopP as number }),
					...(options.nvidiaBaseURL && { baseURL: options.nvidiaBaseURL as string }),
				},
			};

		case 'databricks':
			return {
				name: 'generative-databricks',
				config: {
					...(options.databricksModel && { model: options.databricksModel as string }),
					...(options.databricksEndpoint && { endpoint: options.databricksEndpoint as string }),
					...(options.databricksTemperature !== undefined && {
						temperature: options.databricksTemperature as number,
					}),
					...(options.databricksMaxTokens && { maxTokens: options.databricksMaxTokens as number }),
					...(options.databricksFrequencyPenalty !== undefined && {
						frequencyPenalty: options.databricksFrequencyPenalty as number,
					}),
					...(options.databricksPresencePenalty !== undefined && {
						presencePenalty: options.databricksPresencePenalty as number,
					}),
					...(options.databricksTopP !== undefined && { topP: options.databricksTopP as number }),
					...(options.databricksN && { n: options.databricksN as number }),
					...(options.databricksLogProbs !== undefined && { logProbs: options.databricksLogProbs as boolean }),
					...(options.databricksTopLogProbs && { topLogProbs: options.databricksTopLogProbs as number }),
					...(options.databricksStop && { stop: { values: (options.databricksStop as string).split(',').map((s) => s.trim()) } }),
				},
			};

		case 'friendliai':
			return {
				name: 'generative-friendliai',
				config: {
					...(options.friendliaiModel && { model: options.friendliaiModel as string }),
					...(options.friendliaiTemperature !== undefined && {
						temperature: options.friendliaiTemperature as number,
					}),
					...(options.friendliaiMaxTokens && { maxTokens: options.friendliaiMaxTokens as number }),
					...(options.friendliaiTopP !== undefined && { topP: options.friendliaiTopP as number }),
					...(options.friendliaiN && { n: options.friendliaiN as number }),
					...(options.friendliaiBaseURL && { baseURL: options.friendliaiBaseURL as string }),
				},
			};

		case 'xai':
			return {
				name: 'generative-xai',
				config: {
					...(options.xaiModel && { model: options.xaiModel as string }),
					...(options.xaiTemperature !== undefined && { temperature: options.xaiTemperature as number }),
					...(options.xaiMaxTokens && { maxTokens: options.xaiMaxTokens as number }),
					...(options.xaiTopP !== undefined && { topP: options.xaiTopP as number }),
					...(options.xaiBaseURL && { baseURL: options.xaiBaseURL as string }),
				},
			};

		case 'contextualai':
			return {
				name: 'generative-contextualai',
				config: {
					...(options.contextualaiModel && { model: options.contextualaiModel as string }),
					...(options.contextualaiTemperature !== undefined && {
						temperature: options.contextualaiTemperature as number,
					}),
					...(options.contextualaiMaxNewTokens && { maxNewTokens: options.contextualaiMaxNewTokens as number }),
					...(options.contextualaiTopP !== undefined && { topP: options.contextualaiTopP as number }),
					...(options.contextualaiSystemPrompt && { systemPrompt: options.contextualaiSystemPrompt as string }),
					...(options.contextualaiAvoidCommentary !== undefined && {
						avoidCommentary: options.contextualaiAvoidCommentary as boolean,
					}),
					...(options.contextualaiKnowledge && {
						knowledge: { values: (options.contextualaiKnowledge as string).split(',').map((s) => s.trim()) },
					}),
				},
			};

		default:
			return undefined;
	}
}
