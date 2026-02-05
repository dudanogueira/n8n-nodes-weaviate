import type { IExecuteFunctions } from 'n8n-workflow';
import { execute as createExecute } from '../../operations/collection/create';
import { execute as deleteExecute } from '../../operations/collection/delete';
import { execute as existsExecute } from '../../operations/collection/exists';
import { execute as getExecute } from '../../operations/collection/get';
import { execute as listExecute } from '../../operations/collection/list';

// Mock do cliente Weaviate
const mockClose = jest.fn();
const mockConfigGet = jest.fn();
const mockCollectionsCreate = jest.fn();
const mockCollectionsDelete = jest.fn();
const mockCollectionsExists = jest.fn();
const mockCollectionsListAll = jest.fn();
const mockCollectionsGet = jest.fn(() => ({
	config: {
		get: mockConfigGet,
	},
}));

jest.mock('../../helpers/client', () => ({
	getWeaviateClient: jest.fn(async function (this: IExecuteFunctions) {
		return {
			collections: {
				create: mockCollectionsCreate,
				delete: mockCollectionsDelete,
				exists: mockCollectionsExists,
				listAll: mockCollectionsListAll,
				get: mockCollectionsGet,
			},
			close: mockClose,
		};
	}),
}));

describe('Weaviate Collection Operations', () => {
	let executeFunctions: IExecuteFunctions;

	beforeEach(() => {
		jest.clearAllMocks();

		// Mock do IExecuteFunctions
		executeFunctions = {
			getNodeParameter: jest.fn((parameterName: string) => {
				if (parameterName === 'collectionConfig') {
					return JSON.stringify({
						name: 'TestCollection',
						vectorizers: {
							default: {
								vectorizer: 'text2vec-openai',
							},
						},
					});
				}
				return undefined;
			}),
		} as unknown as IExecuteFunctions;

		// Mock da resposta do config.get()
		mockConfigGet.mockResolvedValue({
			name: 'TestCollection',
			vectorizers: {
				default: {
					vectorizer: 'text2vec-openai',
				},
			},
		});
	});

	describe('create', () => {
		it('should create a collection successfully', async () => {
			const result = await createExecute.call(executeFunctions, 0);

			expect(mockCollectionsCreate).toHaveBeenCalledWith({
				name: 'TestCollection',
				vectorizers: {
					default: {
						vectorizer: 'text2vec-openai',
					},
				},
			});

			expect(result).toHaveLength(1);
			expect(result[0].json).toMatchObject({
				success: true,
				collectionName: 'TestCollection',
			});

			expect(mockClose).toHaveBeenCalled();
		});

		it('should handle invalid JSON configuration', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockReturnValue('invalid json');

			await expect(createExecute.call(executeFunctions, 0)).rejects.toThrow();
			expect(mockClose).toHaveBeenCalled();
		});

		it('should close client even if creation fails', async () => {
			mockCollectionsCreate.mockRejectedValue(new Error('Creation failed'));

			await expect(createExecute.call(executeFunctions, 0)).rejects.toThrow('Creation failed');
			expect(mockClose).toHaveBeenCalled();
		});
	});

	describe('delete', () => {
		beforeEach(() => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collectionName') {
						return 'TestCollection';
					}
					return undefined;
				},
			);
		});

		it('should delete a collection successfully', async () => {
			const result = await deleteExecute.call(executeFunctions, 0);

			expect(mockCollectionsDelete).toHaveBeenCalledWith('TestCollection');
			expect(result).toHaveLength(1);
			expect(result[0].json).toMatchObject({
				success: true,
				collectionName: 'TestCollection',
				message: 'Collection "TestCollection" deleted successfully',
			});
			expect(mockClose).toHaveBeenCalled();
		});

		it('should handle resourceLocator format', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockReturnValue({
				mode: 'list',
				value: 'TestCollection',
			});

			const result = await deleteExecute.call(executeFunctions, 0);

			expect(mockCollectionsDelete).toHaveBeenCalledWith('TestCollection');
			expect(result[0].json.collectionName).toBe('TestCollection');
			expect(mockClose).toHaveBeenCalled();
		});
	});

	describe('exists', () => {
		beforeEach(() => {
			(executeFunctions.getNodeParameter as jest.Mock).mockReturnValue('TestCollection');
		});

		it('should check if collection exists and return true', async () => {
			mockCollectionsExists.mockResolvedValue(true);

			const result = await existsExecute.call(executeFunctions, 0);

			expect(mockCollectionsExists).toHaveBeenCalledWith('TestCollection');
			expect(result).toHaveLength(1);
			expect(result[0].json).toMatchObject({
				collectionName: 'TestCollection',
				exists: true,
			});
			expect(mockClose).toHaveBeenCalled();
		});

		it('should check if collection exists and return false', async () => {
			mockCollectionsExists.mockResolvedValue(false);

			const result = await existsExecute.call(executeFunctions, 0);

			expect(result[0].json.exists).toBe(false);
			expect(mockClose).toHaveBeenCalled();
		});
	});

	describe('get', () => {
		beforeEach(() => {
			(executeFunctions.getNodeParameter as jest.Mock).mockReturnValue('TestCollection');
			mockConfigGet.mockResolvedValue({
				name: 'TestCollection',
				vectorizers: {
					default: {
						vectorizer: 'text2vec-openai',
					},
				},
			});
		});

		it('should get collection configuration', async () => {
			const result = await getExecute.call(executeFunctions, 0);

			expect(mockCollectionsGet).toHaveBeenCalledWith('TestCollection');
			expect(mockConfigGet).toHaveBeenCalled();
			expect(result).toHaveLength(1);
			expect(result[0].json).toMatchObject({
				collectionName: 'TestCollection',
				config: {
					name: 'TestCollection',
				},
			});
			expect(mockClose).toHaveBeenCalled();
		});
	});

	describe('list', () => {
		it('should list all collections (array format)', async () => {
			mockCollectionsListAll.mockResolvedValue([
				{ name: 'Collection1' },
				{ name: 'Collection2' },
				{ name: 'Collection3' },
			]);

			const result = await listExecute.call(executeFunctions, 0);

			expect(mockCollectionsListAll).toHaveBeenCalled();
			expect(result).toHaveLength(1);
			expect(result[0].json).toMatchObject({
				collections: ['Collection1', 'Collection2', 'Collection3'],
				count: 3,
			});
			expect(mockClose).toHaveBeenCalled();
		});

		it('should list all collections (object format)', async () => {
			mockCollectionsListAll.mockResolvedValue({
				Collection1: {},
				Collection2: {},
			});

			const result = await listExecute.call(executeFunctions, 0);

			expect(result[0].json).toMatchObject({
				collections: ['Collection1', 'Collection2'],
				count: 2,
			});
			expect(mockClose).toHaveBeenCalled();
		});

		it('should sort collections alphabetically', async () => {
			mockCollectionsListAll.mockResolvedValue([
				{ name: 'Zebra' },
				{ name: 'Apple' },
				{ name: 'Mango' },
			]);

			const result = await listExecute.call(executeFunctions, 0);

			expect(result[0].json.collections).toEqual(['Apple', 'Mango', 'Zebra']);
		});
	});
});
