import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class WeaviateApi implements ICredentialType {
	name = 'weaviateApi';

	displayName = 'Weaviate API';

	documentationUrl = 'https://weaviate.io/developers/weaviate/connections';

	icon = 'file:weaviate.svg' as const;

	properties: INodeProperties[] = [
		{
			displayName: 'Connection Type',
			name: 'connection_type',
			type: 'options',
			options: [
				{
					name: 'Weaviate Cloud',
					value: 'weaviate_cloud',
					description: 'Connect to Weaviate Cloud instance',
				},
				{
					name: 'Custom Connection',
					value: 'custom_connection',
					description: 'Connect to self-hosted or custom Weaviate instance',
				},
			],
			default: 'weaviate_cloud',
		},

		// ===== Weaviate Cloud Settings =====
		{
			displayName: 'Weaviate Cloud Endpoint',
			name: 'weaviate_cloud_endpoint',
			type: 'string',
			default: '',
			required: true,
			placeholder: 'https://my-cluster.weaviate.network',
			description: 'Your Weaviate Cloud cluster URL',
			displayOptions: {
				show: {
					connection_type: ['weaviate_cloud'],
				},
			},
		},
		{
			displayName: 'Weaviate API Key',
			name: 'weaviate_api_key',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			placeholder: 'Weaviate API Key',
			description: 'API key for Weaviate authentication',
			displayOptions: {
				show: {
					connection_type: ['weaviate_cloud'],
				},
			},
		},

		// ===== Custom Connection Settings =====
		{
			displayName: 'HTTP Host',
			name: 'custom_connection_http_host',
			type: 'string',
			default: 'localhost',
			required: true,
			placeholder: 'localhost or weaviate.example.com',
			description: 'The HTTP host for the Weaviate instance',
			displayOptions: {
				show: {
					connection_type: ['custom_connection'],
				},
			},
		},
		{
			displayName: 'HTTP Port',
			name: 'custom_connection_http_port',
			type: 'number',
			default: 8080,
			required: true,
			description: 'The HTTP port for the Weaviate instance',
			displayOptions: {
				show: {
					connection_type: ['custom_connection'],
				},
			},
		},
		{
			displayName: 'HTTP Secure',
			name: 'custom_connection_http_secure',
			type: 'boolean',
			default: false,
			description: 'Whether to use HTTPS for HTTP connection',
			displayOptions: {
				show: {
					connection_type: ['custom_connection'],
				},
			},
		},
		{
			displayName: 'gRPC Host',
			name: 'custom_connection_grpc_host',
			type: 'string',
			default: 'localhost',
			required: true,
			placeholder: 'localhost or weaviate.example.com',
			description: 'The gRPC host for the Weaviate instance',
			displayOptions: {
				show: {
					connection_type: ['custom_connection'],
				},
			},
		},
		{
			displayName: 'gRPC Port',
			name: 'custom_connection_grpc_port',
			type: 'number',
			default: 50051,
			required: true,
			description: 'The gRPC port for the Weaviate instance',
			displayOptions: {
				show: {
					connection_type: ['custom_connection'],
				},
			},
		},
		{
			displayName: 'gRPC Secure',
			name: 'custom_connection_grpc_secure',
			type: 'boolean',
			default: false,
			description: 'Whether to use secure gRPC connection',
			displayOptions: {
				show: {
					connection_type: ['custom_connection'],
				},
			},
		},
		{
			displayName: 'Weaviate API Key',
			name: 'weaviate_api_key',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			placeholder: 'Optional API Key',
			description: 'Optional API key for Weaviate authentication',
			displayOptions: {
				show: {
					connection_type: ['custom_connection'],
				},
			},
		},

		// ===== Environment Variable Headers =====
		{
			displayName: 'Read Environment Variables for Headers',
			name: 'read_env_vars_for_headers',
			type: 'boolean',
			default: true,
			description: 'Whether to automatically read API keys from environment variables and add them as HTTP headers for model providers (OpenAI, Cohere, Anthropic, etc.)',
			hint: 'Supported environment variables: OPENAI_APIKEY, COHERE_APIKEY, HUGGINGFACE_APIKEY, ANTHROPIC_APIKEY, AWS_ACCESS_KEY, AWS_SECRET_KEY, VERTEX_APIKEY, GOOGLE_STUDIO_APIKEY. See <a href="https://docs.weaviate.io/weaviate/model-providers" target="_blank">documentation</a> for details.',
		},

		// ===== Custom Headers (JSON Override) =====
		{
			displayName: 'Custom Headers (JSON)',
			name: 'custom_headers_json',
			type: 'json',
			default: {},
			placeholder: '{\n  "X-Custom-Header": "value",\n  "X-OpenAI-Api-Key": "override-value"\n}',
			description: 'Custom headers as JSON object. These headers will override environment variables and other headers.',
			hint: 'Use this to add custom headers or override headers from environment variables. Priority: Custom Headers > Environment Variables.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.connection_type === "weaviate_cloud" ? $credentials.weaviate_cloud_endpoint : ("http" + ($credentials.custom_connection_http_secure ? "s" : "") + "://" + $credentials.custom_connection_http_host + ":" + $credentials.custom_connection_http_port)}}',
			url: '/v1/.well-known/ready',
			method: 'GET',
		},
	};
}
