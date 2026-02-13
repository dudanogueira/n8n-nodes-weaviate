import type { IDataObject, INodeExecutionData } from 'n8n-workflow';
import type { Collection } from 'weaviate-client';
import { Filters } from 'weaviate-client';

/**
 * Builds a Weaviate filter using the collection's filter builder
 * Converts JSON filter format to Weaviate FilterValue objects
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildWeaviateFilter(collection: Collection<any>, filterJson: IDataObject): any {
	// Handle composite filters (AND/OR)
	if ('operator' in filterJson && filterJson.operator === 'And' && 'operands' in filterJson) {
		const operands = filterJson.operands as IDataObject[];
		return Filters.and(...operands.map((f) => buildWeaviateFilter(collection, f)));
	}
	if ('operator' in filterJson && filterJson.operator === 'Or' && 'operands' in filterJson) {
		const operands = filterJson.operands as IDataObject[];
		return Filters.or(...operands.map((f) => buildWeaviateFilter(collection, f)));
	}

	// Handle simple filters
	const { path, operator } = filterJson;
	if (!path || !operator) {
		throw new Error('Filter must have "path" and "operator" properties');
	}

	// Get the property path (handle both string and array formats)
	const propertyPath = Array.isArray(path) ? path[0] : path;
	const filterBuilder = collection.filter.byProperty(propertyPath as string);

	// Build filter based on operator
	switch (operator) {
		case 'Equal':
			if ('valueText' in filterJson) return filterBuilder.equal(filterJson.valueText as string);
			if ('valueNumber' in filterJson) return filterBuilder.equal(filterJson.valueNumber as number);
			if ('valueBoolean' in filterJson) return filterBuilder.equal(filterJson.valueBoolean as boolean);
			if ('valueInt' in filterJson) return filterBuilder.equal(filterJson.valueInt as number);
			throw new Error('Equal operator requires valueText, valueNumber, valueBoolean, or valueInt');

		case 'NotEqual':
			if ('valueText' in filterJson) return filterBuilder.notEqual(filterJson.valueText as string);
			if ('valueNumber' in filterJson) return filterBuilder.notEqual(filterJson.valueNumber as number);
			if ('valueBoolean' in filterJson) return filterBuilder.notEqual(filterJson.valueBoolean as boolean);
			if ('valueInt' in filterJson) return filterBuilder.notEqual(filterJson.valueInt as number);
			throw new Error('NotEqual operator requires valueText, valueNumber, valueBoolean, or valueInt');

		case 'GreaterThan':
			if ('valueNumber' in filterJson) return filterBuilder.greaterThan(filterJson.valueNumber as number);
			if ('valueInt' in filterJson) return filterBuilder.greaterThan(filterJson.valueInt as number);
			if ('valueDate' in filterJson) return filterBuilder.greaterThan(new Date(filterJson.valueDate as string));
			throw new Error('GreaterThan operator requires valueNumber, valueInt, or valueDate');

		case 'GreaterThanEqual':
			if ('valueNumber' in filterJson) return filterBuilder.greaterOrEqual(filterJson.valueNumber as number);
			if ('valueInt' in filterJson) return filterBuilder.greaterOrEqual(filterJson.valueInt as number);
			if ('valueDate' in filterJson) return filterBuilder.greaterOrEqual(new Date(filterJson.valueDate as string));
			throw new Error('GreaterThanEqual operator requires valueNumber, valueInt, or valueDate');

		case 'LessThan':
			if ('valueNumber' in filterJson) return filterBuilder.lessThan(filterJson.valueNumber as number);
			if ('valueInt' in filterJson) return filterBuilder.lessThan(filterJson.valueInt as number);
			if ('valueDate' in filterJson) return filterBuilder.lessThan(new Date(filterJson.valueDate as string));
			throw new Error('LessThan operator requires valueNumber, valueInt, or valueDate');

		case 'LessThanEqual':
			if ('valueNumber' in filterJson) return filterBuilder.lessOrEqual(filterJson.valueNumber as number);
			if ('valueInt' in filterJson) return filterBuilder.lessOrEqual(filterJson.valueInt as number);
			if ('valueDate' in filterJson) return filterBuilder.lessOrEqual(new Date(filterJson.valueDate as string));
			throw new Error('LessThanEqual operator requires valueNumber, valueInt, or valueDate');

		case 'Like':
			if ('valueText' in filterJson) return filterBuilder.like(filterJson.valueText as string);
			throw new Error('Like operator requires valueText');

		case 'ContainsAny':
			if ('valueTextArray' in filterJson) return filterBuilder.containsAny(filterJson.valueTextArray as string[]);
			throw new Error('ContainsAny operator requires valueTextArray');

		case 'ContainsAll':
			if ('valueTextArray' in filterJson) return filterBuilder.containsAll(filterJson.valueTextArray as string[]);
			throw new Error('ContainsAll operator requires valueTextArray');

		case 'IsNull':
			if ('valueBoolean' in filterJson) return filterBuilder.isNull(filterJson.valueBoolean as boolean);
			throw new Error('IsNull operator requires valueBoolean');

		case 'WithinGeoRange':
			if ('valueGeoRange' in filterJson) {
				const geoRange = filterJson.valueGeoRange as IDataObject;
				return filterBuilder.withinGeoRange({
					latitude: geoRange.latitude as number,
					longitude: geoRange.longitude as number,
					distance: geoRange.distance as number,
				});
			}
			throw new Error('WithinGeoRange operator requires valueGeoRange object');

		default:
			throw new Error(`Unsupported operator: ${operator}`);
	}
}

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

/**
 * Checks if a value is not empty (not null, undefined, empty object, or empty array)
 */
export function isNotEmpty(value: unknown): boolean {
	if (value === null || value === undefined) {
		return false;
	}
	if (Array.isArray(value)) {
		return value.length > 0;
	}
	if (typeof value === 'object') {
		return Object.keys(value).length > 0;
	}
	return true;
}
