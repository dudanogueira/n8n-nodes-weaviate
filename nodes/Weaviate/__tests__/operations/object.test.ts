import type { IExecuteFunctions } from 'n8n-workflow';
import { execute as insertExecute } from '../../operations/object/insert';
import { execute as insertManyExecute } from '../../operations/object/insertMany';
import { execute as getByIdExecute } from '../../operations/object/getById';
import { execute as deleteByIdExecute } from '../../operations/object/deleteById';
import { execute as deleteManyExecute } from '../../operations/object/deleteMany';

// Mock do cliente Weaviate
const mockClose = jest.fn();
const mockInsert = jest.fn();
const mockInsertMany = jest.fn();
const mockFetchObjectById = jest.fn();
const mockDeleteById = jest.fn();
const mockDeleteMany = jest.fn();
const mockWithTenant = jest.fn();

const mockCollection = {
	data: {
		insert: mockInsert,
		insertMany: mockInsertMany,
		deleteById: mockDeleteById,
		deleteMany: mockDeleteMany,
	},
	query: {
		fetchObjectById: mockFetchObjectById,
	},
	withTenant: mockWithTenant,
};

jest.mock('../../helpers/client', () => ({
	getWeaviateClient: jest.fn(async function (this: IExecuteFunctions) {
		return {
			collections: {
				get: jest.fn(() => mockCollection),
			},
			close: mockClose,
		};
	}),
}));

describe('Weaviate Object Operations', () => {
	let executeFunctions: IExecuteFunctions;

	beforeEach(() => {
		jest.clearAllMocks();

		// Reset mock implementation
		mockWithTenant.mockReturnValue(mockCollection);

		executeFunctions = {
			getNodeParameter: jest.fn(),
		} as unknown as IExecuteFunctions;
	});

	describe('insert', () => {
		beforeEach(() => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collection') return 'TestCollection';
					if (parameterName === 'properties') return '{"name": "Test Object", "description": "A test"}';
					if (parameterName === 'vector') return '';
					if (parameterName === 'objectId') return '';
					if (parameterName === 'additionalOptions') return {};
					return undefined;
				},
			);

			mockInsert.mockResolvedValue('test-uuid-123');
		});

		it('should insert an object successfully', async () => {
			const result = await insertExecute.call(executeFunctions, 0);

			expect(mockInsert).toHaveBeenCalledWith(
				expect.objectContaining({
					properties: { name: 'Test Object', description: 'A test' },
				}),
			);
			expect(result).toHaveLength(1);
			expect(result[0].json).toMatchObject({
				success: true,
				collectionName: 'TestCollection',
			});
			expect(mockClose).toHaveBeenCalled();
		});

		it('should insert object with custom ID', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collection') return 'TestCollection';
					if (parameterName === 'properties') return '{"name": "Test"}';
					if (parameterName === 'vector') return '';
					if (parameterName === 'objectId') return 'custom-id-123';
					if (parameterName === 'additionalOptions') return {};
					return undefined;
				},
			);

			await insertExecute.call(executeFunctions, 0);

			expect(mockInsert).toHaveBeenCalledWith(
				expect.objectContaining({
					id: 'custom-id-123',
				}),
			);
		});

		it('should insert object with vector', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collection') return 'TestCollection';
					if (parameterName === 'properties') return '{"name": "Test"}';
					if (parameterName === 'vector') return '[0.1, 0.2, 0.3]';
					if (parameterName === 'objectId') return '';
					if (parameterName === 'additionalOptions') return {};
					return undefined;
				},
			);

			await insertExecute.call(executeFunctions, 0);

			expect(mockInsert).toHaveBeenCalledWith(
				expect.objectContaining({
					vectors: [0.1, 0.2, 0.3],
				}),
			);
		});

		it('should not send empty vector array (allows auto-vectorization)', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collection') return 'TestCollection';
					if (parameterName === 'properties') return '{"name": "Test"}';
					if (parameterName === 'vector') return '[]';
					if (parameterName === 'objectId') return '';
					if (parameterName === 'additionalOptions') return {};
					return undefined;
				},
			);

			await insertExecute.call(executeFunctions, 0);

			expect(mockInsert).toHaveBeenCalledWith(
				expect.not.objectContaining({
					vectors: expect.anything(),
				}),
			);
		});

		it('should insert object with tenant', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collection') return 'TestCollection';
					if (parameterName === 'properties') return '{"name": "Test"}';
					if (parameterName === 'vector') return '';
					if (parameterName === 'objectId') return '';
					if (parameterName === 'additionalOptions') return { tenant: 'tenant-1' };
					return undefined;
				},
			);

			await insertExecute.call(executeFunctions, 0);

			expect(mockWithTenant).toHaveBeenCalledWith('tenant-1');
		});
	});

	describe('getById', () => {
		beforeEach(() => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collection') return 'TestCollection';
					if (parameterName === 'objectId') return 'test-uuid-123';
					if (parameterName === 'additionalOptions') return {};
					return undefined;
				},
			);

			mockFetchObjectById.mockResolvedValue({
				uuid: 'test-uuid-123',
				properties: { name: 'Test Object' },
			});
		});

		it('should get object by ID successfully', async () => {
			const result = await getByIdExecute.call(executeFunctions, 0);

			expect(mockFetchObjectById).toHaveBeenCalledWith('test-uuid-123', {
				includeVector: false,
			});
			expect(result).toHaveLength(1);
			expect(result[0].json).toMatchObject({
				collection: 'TestCollection',
				id: 'test-uuid-123',
				properties: { name: 'Test Object' },
			});
			expect(mockClose).toHaveBeenCalled();
		});

		it('should get object with vectors', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collection') return 'TestCollection';
					if (parameterName === 'objectId') return 'test-uuid-123';
					if (parameterName === 'additionalOptions') return { includeVectors: true };
					return undefined;
				},
			);

			await getByIdExecute.call(executeFunctions, 0);

			expect(mockFetchObjectById).toHaveBeenCalledWith('test-uuid-123', {
				includeVector: true,
			});
		});

		it('should get object with tenant', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collection') return 'TestCollection';
					if (parameterName === 'objectId') return 'test-uuid-123';
					if (parameterName === 'additionalOptions') return { tenant: 'tenant-1' };
					return undefined;
				},
			);

			await getByIdExecute.call(executeFunctions, 0);

			expect(mockWithTenant).toHaveBeenCalledWith('tenant-1');
		});
	});

	describe('deleteById', () => {
		beforeEach(() => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collection') return 'TestCollection';
					if (parameterName === 'objectId') return 'test-uuid-123';
					if (parameterName === 'additionalOptions') return {};
					return undefined;
				},
			);
		});

		it('should delete object by ID successfully', async () => {
			const result = await deleteByIdExecute.call(executeFunctions, 0);

			expect(mockDeleteById).toHaveBeenCalledWith(
				expect.objectContaining({
					id: 'test-uuid-123',
				}),
			);
			expect(result).toHaveLength(1);
			expect(result[0].json).toMatchObject({
				success: true,
				collectionName: 'TestCollection',
				id: 'test-uuid-123',
			});
			expect(mockClose).toHaveBeenCalled();
		});

		it('should delete object with tenant', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collection') return 'TestCollection';
					if (parameterName === 'objectId') return 'test-uuid-123';
					if (parameterName === 'additionalOptions') return { tenant: 'tenant-1' };
					return undefined;
				},
			);

			await deleteByIdExecute.call(executeFunctions, 0);

			expect(mockDeleteById).toHaveBeenCalledWith(
				expect.objectContaining({
					id: 'test-uuid-123',
					tenant: 'tenant-1',
				}),
			);
		});
	});

	describe('insertMany', () => {
		beforeEach(() => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collection') return 'TestCollection';
					if (parameterName === 'objects')
						return JSON.stringify([
							{ properties: { name: 'Object 1' } },
							{ properties: { name: 'Object 2' } },
							{ properties: { name: 'Object 3' } },
						]);
					if (parameterName === 'additionalOptions') return {};
					return undefined;
				},
			);

			mockInsertMany.mockResolvedValue({
				uuids: {
					0: 'uuid-1',
					1: 'uuid-2',
					2: 'uuid-3',
				},
				errors: {},
			});
		});

		it('should insert multiple objects successfully', async () => {
			const result = await insertManyExecute.call(executeFunctions, 0);

			expect(mockInsertMany).toHaveBeenCalledWith([
				{ properties: { name: 'Object 1' } },
				{ properties: { name: 'Object 2' } },
				{ properties: { name: 'Object 3' } },
			]);
			expect(result).toHaveLength(1);
			expect(result[0].json).toMatchObject({
				success: true,
				inserted: 3,
				errors: 0,
			});
			expect(mockClose).toHaveBeenCalled();
		});

		it('should handle partial success with errors', async () => {
			mockInsertMany.mockResolvedValue({
				uuids: {
					0: 'uuid-1',
					1: 'uuid-2',
				},
				errors: {
					2: 'Validation error',
				},
			});

			const result = await insertManyExecute.call(executeFunctions, 0);

			expect(result[0].json).toMatchObject({
				success: false,
				inserted: 2,
				errors: 1,
			});
			expect(result[0].json.errorDetails).toBeDefined();
		});

		it('should insert objects with tenant', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collection') return 'TestCollection';
					if (parameterName === 'objects')
						return JSON.stringify([{ properties: { name: 'Test' } }]);
					if (parameterName === 'additionalOptions') return { tenant: 'tenant-1' };
					return undefined;
				},
			);

			await insertManyExecute.call(executeFunctions, 0);

			expect(mockWithTenant).toHaveBeenCalledWith('tenant-1');
			expect(mockInsertMany).toHaveBeenCalledWith([{ properties: { name: 'Test' } }]);
		});

		it('should throw error if objects is not an array', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collection') return 'TestCollection';
					if (parameterName === 'objects') return '{"properties": {"name": "Single"}}';
					if (parameterName === 'additionalOptions') return {};
					return undefined;
				},
			);

			await expect(insertManyExecute.call(executeFunctions, 0)).rejects.toThrow(
				'Objects must be an array',
			);
			expect(mockClose).toHaveBeenCalled();
		});
	});

	describe('deleteMany', () => {
		beforeEach(() => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collection') return 'TestCollection';
					if (parameterName === 'whereFilter')
						return '{"path": ["category"], "operator": "Equal", "valueText": "test"}';
					if (parameterName === 'dryRun') return false;
					if (parameterName === 'additionalOptions') return {};
					return undefined;
				},
			);

			mockDeleteMany.mockResolvedValue({
				successful: 5,
				failed: 0,
			});
		});

		it('should delete multiple objects successfully', async () => {
			const result = await deleteManyExecute.call(executeFunctions, 0);

			expect(mockDeleteMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: { path: ['category'], operator: 'Equal', valueText: 'test' },
					dryRun: false,
				}),
			);
			expect(result).toHaveLength(1);
			expect(result[0].json).toMatchObject({
				success: true,
				deleted: 5,
				failed: 0,
				dryRun: false,
			});
			expect(mockClose).toHaveBeenCalled();
		});

		it('should perform dry run without deleting', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collection') return 'TestCollection';
					if (parameterName === 'whereFilter')
						return '{"path": ["status"], "operator": "Equal", "valueText": "old"}';
					if (parameterName === 'dryRun') return true;
					if (parameterName === 'additionalOptions') return {};
					return undefined;
				},
			);

			mockDeleteMany.mockResolvedValue({
				successful: 10,
				failed: 0,
			});

			const result = await deleteManyExecute.call(executeFunctions, 0);

			expect(mockDeleteMany).toHaveBeenCalledWith(
				expect.objectContaining({
					dryRun: true,
				}),
			);
			expect(result[0].json.dryRun).toBe(true);
		});

		it('should handle partial failures', async () => {
			mockDeleteMany.mockResolvedValue({
				successful: 3,
				failed: 2,
			});

			const result = await deleteManyExecute.call(executeFunctions, 0);

			expect(result[0].json).toMatchObject({
				success: true,
				deleted: 3,
				failed: 2,
			});
		});

		it('should delete with tenant', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collection') return 'TestCollection';
					if (parameterName === 'whereFilter') return '{"path": ["id"], "operator": "Equal", "valueText": "1"}';
					if (parameterName === 'dryRun') return false;
					if (parameterName === 'additionalOptions') return { tenant: 'tenant-1' };
					return undefined;
				},
			);

			await deleteManyExecute.call(executeFunctions, 0);

			expect(mockDeleteMany).toHaveBeenCalledWith(
				expect.objectContaining({
					tenant: 'tenant-1',
				}),
			);
		});
	});
});
