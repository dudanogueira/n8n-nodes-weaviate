/* eslint-disable @typescript-eslint/no-explicit-any */
import { parseJsonSafe, buildOperationMetadata, formatSearchResults, validateRequiredFields } from '../../helpers/utils';

describe('Utils', () => {
	describe('parseJsonSafe', () => {
		it('should parse valid JSON', () => {
			const input = '{"key": "value"}';
			const result = parseJsonSafe(input, 'testField');
			
			expect(result).toEqual({ key: 'value' });
		});

		it('should throw error for invalid JSON', () => {
			const input = 'invalid json';
			
			expect(() => parseJsonSafe(input, 'testField')).toThrow();
		});

		it('should handle empty string', () => {
			const input = '';
			
			expect(() => parseJsonSafe(input, 'testField')).toThrow();
		});
	});

	describe('buildOperationMetadata', () => {
		it('should build metadata with operation name', () => {
			const result = buildOperationMetadata('test:operation', { id: '123' });

			expect(result).toHaveProperty('operation', 'test:operation');
			expect(result).toHaveProperty('timestamp');
		});

		it('should include additional data in metadata', () => {
			const additionalData = { collectionName: 'TestCollection', count: 5 };
			const result = buildOperationMetadata('collection:create', additionalData);

			expect(result).toMatchObject({
				operation: 'collection:create',
				...additionalData,
			});
		});
	});

	describe('formatSearchResults', () => {
		it('should format search results with objects', () => {
			const results = {
				objects: [
					{
						uuid: 'uuid-1',
						properties: { title: 'Test 1' },
						vector: [0.1, 0.2],
						metadata: { certainty: 0.9, distance: 0.1 },
					},
					{
						uuid: 'uuid-2',
						properties: { title: 'Test 2' },
						vector: [0.3, 0.4],
						metadata: { score: 2.5 },
					},
				],
			};

			const formatted = formatSearchResults(results, { operation: 'search:test' });

			expect(formatted).toHaveLength(2);
			expect(formatted[0].json).toMatchObject({
				id: 'uuid-1',
				properties: { title: 'Test 1' },
				vector: [0.1, 0.2],
			});
			expect(formatted[0].json.metadata).toMatchObject({
				certainty: 0.9,
				distance: 0.1,
				operation: 'search:test',
			});
			expect(formatted[1].json).toMatchObject({
				id: 'uuid-2',
				properties: { title: 'Test 2' },
			});
			expect(formatted[1].json.metadata).toHaveProperty('score', 2.5);
		});

		it('should handle empty results', () => {
			const results = {
				objects: [],
			};

			const formatted = formatSearchResults(results, { operation: 'search:test' });

			expect(formatted).toHaveLength(1);
			expect(formatted[0].json).toMatchObject({
				objects: [],
				metadata: {
					count: 0,
					operation: 'search:test',
				},
			});
		});

		it('should handle null results', () => {
			const formatted = formatSearchResults(null as any, { operation: 'search:test' });

			expect(formatted).toHaveLength(1);
			expect(formatted[0].json.metadata).toHaveProperty('count', 0);
		});

		it('should handle undefined results', () => {
			const formatted = formatSearchResults(undefined as any, { operation: 'search:test' });

			expect(formatted).toHaveLength(1);
			expect(formatted[0].json.metadata).toHaveProperty('count', 0);
		});

		it('should handle results without objects property', () => {
			const results = {};

			const formatted = formatSearchResults(results, { operation: 'search:test' });

			expect(formatted).toHaveLength(1);
			expect(formatted[0].json.metadata).toHaveProperty('count', 0);
		});

		it('should format results without metadata parameter', () => {
			const results = {
				objects: [
					{
						uuid: 'uuid-1',
						properties: { title: 'Test' },
						metadata: {},
					},
				],
			};

			const formatted = formatSearchResults(results);

			expect(formatted).toHaveLength(1);
			expect(formatted[0].json.id).toBe('uuid-1');
		});
	});

	describe('validateRequiredFields', () => {
		it('should not throw for valid data with all required fields', () => {
			const data = {
				name: 'Test',
				email: 'test@example.com',
				age: 25,
			};

			expect(() => validateRequiredFields(data, ['name', 'email'])).not.toThrow();
		});

		it('should throw error for missing field', () => {
			const data = {
				name: 'Test',
			};

			expect(() => validateRequiredFields(data, ['name', 'email'])).toThrow(
				'Required field "email" is missing or empty',
			);
		});

		it('should throw error for null field', () => {
			const data = {
				name: 'Test',
				email: null,
			};

			expect(() => validateRequiredFields(data, ['name', 'email'])).toThrow(
				'Required field "email" is missing or empty',
			);
		});

		it('should throw error for empty string field', () => {
			const data = {
				name: 'Test',
				email: '',
			};

			expect(() => validateRequiredFields(data, ['name', 'email'])).toThrow(
				'Required field "email" is missing or empty',
			);
		});

		it('should throw error for undefined field', () => {
			const data = {
				name: 'Test',
				email: undefined,
			};

			expect(() => validateRequiredFields(data, ['name', 'email'])).toThrow(
				'Required field "email" is missing or empty',
			);
		});

		it('should handle empty required fields array', () => {
			const data = {
				name: 'Test',
			};

			expect(() => validateRequiredFields(data, [])).not.toThrow();
		});

		it('should validate multiple fields', () => {
			const data = {
				name: 'Test',
				email: 'test@example.com',
				age: 25,
			};

			expect(() => validateRequiredFields(data, ['name', 'email', 'age'])).not.toThrow();
		});

		it('should accept zero as valid value', () => {
			const data = {
				count: 0,
			};

			expect(() => validateRequiredFields(data, ['count'])).not.toThrow();
		});

		it('should accept false as valid value', () => {
			const data = {
				active: false,
			};

			expect(() => validateRequiredFields(data, ['active'])).not.toThrow();
		});
	});
});
