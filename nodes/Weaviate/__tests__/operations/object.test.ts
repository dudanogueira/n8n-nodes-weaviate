import type { IExecuteFunctions } from 'n8n-workflow';
import { execute as insertExecute } from '../../operations/object/insert';
import { execute as getByIdExecute } from '../../operations/object/getById';
import { execute as deleteByIdExecute } from '../../operations/object/deleteById';

// Mock do cliente Weaviate
const mockClose = jest.fn();
const mockInsert = jest.fn();
const mockFetchObjectById = jest.fn();
const mockDeleteById = jest.fn();
const mockWithTenant = jest.fn();

const mockCollection = {
	data: {
		insert: mockInsert,
		deleteById: mockDeleteById,
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
});
