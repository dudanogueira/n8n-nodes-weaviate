import type { IDataObject } from 'n8n-workflow';

export interface WeaviateCredentials {
	connection_type: 'weaviate_cloud' | 'custom_connection';
	weaviate_cloud_endpoint?: string;
	weaviate_api_key?: string;
	custom_connection_http_host?: string;
	custom_connection_http_port?: number;
	custom_connection_http_secure?: boolean;
	custom_connection_grpc_host?: string;
	custom_connection_grpc_port?: number;
	custom_connection_grpc_secure?: boolean;
	read_env_vars_for_headers?: boolean;
	custom_headers_json?: string | IDataObject;
}

export interface CollectionConfig {
	name: string;
	description?: string;
	vectorizer?: string;
	properties?: PropertyConfig[];
	vectorIndexConfig?: IDataObject;
	invertedIndexConfig?: IDataObject;
	multiTenancyConfig?: IDataObject;
}

export interface PropertyConfig {
	name: string;
	dataType: string[];
	description?: string;
	indexFilterable?: boolean;
	indexSearchable?: boolean;
	tokenization?: string;
}

export interface SearchOptions {
	limit?: number;
	offset?: number;
	filters?: IDataObject;
	returnProperties?: string[];
	returnMetadata?: string[];
	autocut?: number;
}

export interface WeaviateObject {
	class?: string;
	id?: string;
	properties: IDataObject;
	vector?: number[];
	tenant?: string;
}

export interface BackupConfig {
	backend: string;
	backupId: string;
	include?: string[];
	exclude?: string[];
	waitForCompletion?: boolean;
}
