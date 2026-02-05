import { parseJsonSafe, buildOperationMetadata } from '../../helpers/utils';

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
});
