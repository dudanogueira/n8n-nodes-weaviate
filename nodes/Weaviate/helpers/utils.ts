import type { IDataObject, INodeExecutionData } from 'n8n-workflow';

/**
 * Converts Weaviate search results to n8n execution data format
 */
export function formatSearchResults(results: IDataObject, metadata?: IDataObject): INodeExecutionData[] {
	if (!results || !results.objects || (results.objects as IDataObject[]).length === 0) {
		return [{ json: { objects: [], metadata: { count: 0, ...metadata } } }];
	}

	return (results.objects as IDataObject[]).map((obj: IDataObject) => ({
		json: {
			id: obj.uuid,
			properties: obj.properties,
			vector: obj.vector,
			metadata: {
				certainty: (obj.metadata as IDataObject)?.certainty,
				distance: (obj.metadata as IDataObject)?.distance,
				score: (obj.metadata as IDataObject)?.score,
				explainScore: (obj.metadata as IDataObject)?.explainScore,
				...metadata,
			},
		},
	}));
}

/**
 * Validates that required fields are present
 */
export function validateRequiredFields(data: IDataObject, requiredFields: string[]): void {
	for (const field of requiredFields) {
		if (data[field] === undefined || data[field] === null || data[field] === '') {
			throw new Error(`Required field "${field}" is missing or empty`);
		}
	}
}

/**
 * Parses JSON string safely
 */
export function parseJsonSafe(jsonString: string, fieldName: string): IDataObject {
	try {
		return JSON.parse(jsonString);
	} catch (error) {
		throw new Error(`Invalid JSON in field "${fieldName}": ${(error as Error).message}`);
	}
}

/**
 * Builds metadata object for operation results
 */
export function buildOperationMetadata(operation: string, additionalData?: IDataObject): IDataObject {
	return {
		operation,
		timestamp: new Date().toISOString(),
		...additionalData,
	};
}
