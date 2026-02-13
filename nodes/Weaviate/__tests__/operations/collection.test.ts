import type { IExecuteFunctions } from 'n8n-workflow';
import { execute as createExecute } from '../../operations/collection/create';
import { execute as deleteExecute } from '../../operations/collection/delete';
import { execute as existsExecute } from '../../operations/collection/exists';
import { execute as getExecute } from '../../operations/collection/get';
import { execute as listExecute } from '../../operations/collection/list';

// Mock do cliente Weaviate
const mockClose = jest.fn();
const mockCollectionsDelete = jest.fn();
const mockCollectionsExists = jest.fn();
const mockCollectionsListAll = jest.fn();

// Mock REST API helper
const mockMakeWeaviateRestRequest = jest.fn();

jest.mock('../../helpers/rest', () => ({
	makeWeaviateRestRequest: jest.fn(async function (this: IExecuteFunctions, itemIndex: number, options: any) {
		return mockMakeWeaviateRestRequest(options);
	}),
}));

jest.mock('../../helpers/client', () => ({
	getWeaviateClient: jest.fn(async function (this: IExecuteFunctions) {
		return {
			collections: {
				delete: mockCollectionsDelete,
				exists: mockCollectionsExists,
				listAll: mockCollectionsListAll,
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
						class: 'TestCollection',
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

		// Mock da resposta do REST API
		mockMakeWeaviateRestRequest.mockImplementation((options: any) => {
			if (options.method === 'GET' && options.path.includes('/schema/')) {
				return Promise.resolve({
					class: 'TestCollection',
					vectorizers: {
						default: {
							vectorizer: 'text2vec-openai',
						},
					},
				});
			}
			return Promise.resolve(null);
		});
	});

	describe('create', () => {
		it('should create a collection successfully', async () => {
			const result = await createExecute.call(executeFunctions, 0);

			// Verify POST /schema was called
			expect(mockMakeWeaviateRestRequest).toHaveBeenCalledWith({
				method: 'POST',
				path: '/schema',
				body: {
					class: 'TestCollection',
					vectorizers: {
						default: {
							vectorizer: 'text2vec-openai',
						},
					},
				},
			});

			// Verify GET /schema/{className} was called
			expect(mockMakeWeaviateRestRequest).toHaveBeenCalledWith({
				method: 'GET',
				path: '/schema/TestCollection',
			});

			expect(result).toHaveLength(1);
			expect(result[0].json).toMatchObject({
				success: true,
				collectionName: 'TestCollection',
			});
		});

		it('should handle invalid JSON configuration', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockReturnValue('invalid json');

			await expect(createExecute.call(executeFunctions, 0)).rejects.toThrow();
		});

		it('should handle creation failures', async () => {
			mockMakeWeaviateRestRequest.mockRejectedValue(new Error('Creation failed'));

			await expect(createExecute.call(executeFunctions, 0)).rejects.toThrow('Creation failed');
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
		});

		it('should get collection configuration', async () => {
			const result = await getExecute.call(executeFunctions, 0);

			// Verify GET /schema/{className} was called
			expect(mockMakeWeaviateRestRequest).toHaveBeenCalledWith({
				method: 'GET',
				path: '/schema/TestCollection',
			});

			expect(result).toHaveLength(1);
			expect(result[0].json).toMatchObject({
				collectionName: 'TestCollection',
				config: {
					class: 'TestCollection',
				},
			});
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
