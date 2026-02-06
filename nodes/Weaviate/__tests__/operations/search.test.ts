import type { IExecuteFunctions } from 'n8n-workflow';
import { execute as nearTextExecute } from '../../operations/search/nearText';
import { execute as bm25Execute } from '../../operations/search/bm25';
import { execute as hybridExecute } from '../../operations/search/hybrid';
import { execute as nearVectorExecute } from '../../operations/search/nearVector';

// Mock do cliente Weaviate
const mockClose = jest.fn();
const mockNearText = jest.fn();
const mockBm25 = jest.fn();
const mockHybrid = jest.fn();
const mockNearVector = jest.fn();

const mockQuery = {
	nearText: mockNearText,
	bm25: mockBm25,
	hybrid: mockHybrid,
	nearVector: mockNearVector,
};

const mockCollection = {
	query: mockQuery,
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

describe('Weaviate Search Operations', () => {
	let executeFunctions: IExecuteFunctions;

	beforeEach(() => {
		jest.clearAllMocks();

		executeFunctions = {
			getNodeParameter: jest.fn(),
		} as unknown as IExecuteFunctions;
	});

	describe('nearText', () => {
		beforeEach(() => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collection') return 'TestCollection';
					if (parameterName === 'queryText') return 'search query';
					if (parameterName === 'limit') return 10;
					if (parameterName === 'additionalOptions') return {};
					return undefined;
				},
			);

			mockNearText.mockResolvedValue({
				objects: [
					{
						uuid: 'uuid-1',
						properties: { title: 'Result 1' },
						metadata: { distance: 0.1 },
					},
					{
						uuid: 'uuid-2',
						properties: { title: 'Result 2' },
						metadata: { distance: 0.2 },
					},
				],
			});
		});

		it('should perform nearText search successfully', async () => {
			const result = await nearTextExecute.call(executeFunctions, 0);

			expect(mockNearText).toHaveBeenCalledWith(
				'search query',
				expect.objectContaining({
					limit: 10,
				}),
			);
			expect(result).toHaveLength(2);
			expect(result[0].json).toMatchObject({
				id: 'uuid-1',
				properties: { title: 'Result 1' },
			});
			expect(result[0].json.metadata).toMatchObject({
				distance: 0.1,
				resultCount: 2,
			});
			expect(mockClose).toHaveBeenCalled();
		});

		it('should perform nearText search with offset', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collection') return 'TestCollection';
					if (parameterName === 'queryText') return 'search query';
					if (parameterName === 'limit') return 10;
					if (parameterName === 'additionalOptions') return { offset: 5 };
					return undefined;
				},
			);

			await nearTextExecute.call(executeFunctions, 0);

			expect(mockNearText).toHaveBeenCalledWith(
				'search query',
				expect.objectContaining({
					limit: 10,
					offset: 5,
				}),
			);
		});

		it('should perform nearText search with where filter', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collection') return 'TestCollection';
					if (parameterName === 'queryText') return 'search query';
					if (parameterName === 'limit') return 10;
					if (parameterName === 'additionalOptions')
						return { whereFilter: '{"path": ["category"], "operator": "Equal", "valueText": "tech"}' };
					return undefined;
				},
			);

			await nearTextExecute.call(executeFunctions, 0);

			expect(mockNearText).toHaveBeenCalledWith(
				'search query',
				expect.objectContaining({
					where: { path: ['category'], operator: 'Equal', valueText: 'tech' },
				}),
			);
		});

		it('should perform nearText search with certainty', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collection') return 'TestCollection';
					if (parameterName === 'queryText') return 'search query';
					if (parameterName === 'limit') return 10;
					if (parameterName === 'additionalOptions') return { certainty: 0.7 };
					return undefined;
				},
			);

			await nearTextExecute.call(executeFunctions, 0);

			expect(mockNearText).toHaveBeenCalledWith(
				'search query',
				expect.objectContaining({
					certainty: 0.7,
				}),
			);
		});

		it('should perform nearText search with distance', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collection') return 'TestCollection';
					if (parameterName === 'queryText') return 'search query';
					if (parameterName === 'limit') return 10;
					if (parameterName === 'additionalOptions') return { distance: 0.3 };
					return undefined;
				},
			);

			await nearTextExecute.call(executeFunctions, 0);

			expect(mockNearText).toHaveBeenCalledWith(
				'search query',
				expect.objectContaining({
					distance: 0.3,
				}),
			);
		});

		it('should perform nearText search with returnProperties', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collection') return 'TestCollection';
					if (parameterName === 'queryText') return 'search query';
					if (parameterName === 'limit') return 10;
					if (parameterName === 'additionalOptions') return { returnProperties: 'title, description, date' };
					return undefined;
				},
			);

			await nearTextExecute.call(executeFunctions, 0);

			expect(mockNearText).toHaveBeenCalledWith(
				'search query',
				expect.objectContaining({
					returnProperties: ['title', 'description', 'date'],
				}),
			);
		});

		it('should perform nearText search with includeVector', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collection') return 'TestCollection';
					if (parameterName === 'queryText') return 'search query';
					if (parameterName === 'limit') return 10;
					if (parameterName === 'additionalOptions') return { includeVector: true };
					return undefined;
				},
			);

			await nearTextExecute.call(executeFunctions, 0);

			expect(mockNearText).toHaveBeenCalledWith(
				'search query',
				expect.objectContaining({
					includeVector: true,
				}),
			);
		});

		it('should perform nearText search with autocut', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collection') return 'TestCollection';
					if (parameterName === 'queryText') return 'search query';
					if (parameterName === 'limit') return 10;
					if (parameterName === 'additionalOptions') return { autocut: 3 };
					return undefined;
				},
			);

			await nearTextExecute.call(executeFunctions, 0);

			expect(mockNearText).toHaveBeenCalledWith(
				'search query',
				expect.objectContaining({
					autoLimit: 3,
				}),
			);
		});

		it('should perform nearText search with tenant', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collection') return 'TestCollection';
					if (parameterName === 'queryText') return 'search query';
					if (parameterName === 'limit') return 10;
					if (parameterName === 'additionalOptions') return { tenant: 'tenant-1' };
					return undefined;
				},
			);

			await nearTextExecute.call(executeFunctions, 0);

			expect(mockNearText).toHaveBeenCalledWith(
				'search query',
				expect.objectContaining({
					tenant: 'tenant-1',
				}),
			);
		});
	});

	describe('bm25', () => {
		beforeEach(() => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collection') return 'TestCollection';
					if (parameterName === 'query') return 'keyword search';
					if (parameterName === 'limit') return 10;
					if (parameterName === 'additionalOptions') return {};
					return undefined;
				},
			);

			mockBm25.mockResolvedValue({
				objects: [
					{
						uuid: 'uuid-1',
						properties: { title: 'BM25 Result 1' },
						metadata: { score: 2.5 },
					},
				],
			});
		});

		it('should perform BM25 search successfully', async () => {
			const result = await bm25Execute.call(executeFunctions, 0);

			expect(mockBm25).toHaveBeenCalledWith(
				'keyword search',
				expect.objectContaining({
					limit: 10,
				}),
			);
			expect(result).toHaveLength(1);
			expect(result[0].json).toMatchObject({
				id: 'uuid-1',
				properties: { title: 'BM25 Result 1' },
			});
			expect(result[0].json.metadata).toMatchObject({
				score: 2.5,
				resultCount: 1,
			});
			expect(mockClose).toHaveBeenCalled();
		});

		it('should perform BM25 search with offset', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collection') return 'TestCollection';
					if (parameterName === 'query') return 'keyword search';
					if (parameterName === 'limit') return 10;
					if (parameterName === 'additionalOptions') return { offset: 3 };
					return undefined;
				},
			);

			await bm25Execute.call(executeFunctions, 0);

			expect(mockBm25).toHaveBeenCalledWith(
				'keyword search',
				expect.objectContaining({
					limit: 10,
					offset: 3,
				}),
			);
		});

		it('should perform BM25 search with autocut', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collection') return 'TestCollection';
					if (parameterName === 'query') return 'keyword search';
					if (parameterName === 'limit') return 10;
					if (parameterName === 'additionalOptions') return { autocut: 2 };
					return undefined;
				},
			);

			await bm25Execute.call(executeFunctions, 0);

			expect(mockBm25).toHaveBeenCalledWith(
				'keyword search',
				expect.objectContaining({
					autoLimit: 2,
				}),
			);
		});

		it('should perform BM25 search with returnProperties', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collection') return 'TestCollection';
					if (parameterName === 'query') return 'keyword search';
					if (parameterName === 'limit') return 10;
					if (parameterName === 'additionalOptions') return { returnProperties: 'title, content' };
					return undefined;
				},
			);

			await bm25Execute.call(executeFunctions, 0);

			expect(mockBm25).toHaveBeenCalledWith(
				'keyword search',
				expect.objectContaining({
					returnProperties: ['title', 'content'],
				}),
			);
		});

		it('should perform BM25 search with includeVector', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collection') return 'TestCollection';
					if (parameterName === 'query') return 'keyword search';
					if (parameterName === 'limit') return 10;
					if (parameterName === 'additionalOptions') return { includeVector: true };
					return undefined;
				},
			);

			await bm25Execute.call(executeFunctions, 0);

			expect(mockBm25).toHaveBeenCalledWith(
				'keyword search',
				expect.objectContaining({
					includeVector: true,
				}),
			);
		});

		it('should perform BM25 search with whereFilter', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collection') return 'TestCollection';
					if (parameterName === 'query') return 'keyword search';
					if (parameterName === 'limit') return 10;
					if (parameterName === 'additionalOptions')
						return { whereFilter: '{"path": ["status"], "operator": "Equal", "valueText": "active"}' };
					return undefined;
				},
			);

			await bm25Execute.call(executeFunctions, 0);

			expect(mockBm25).toHaveBeenCalledWith(
				'keyword search',
				expect.objectContaining({
					where: { path: ['status'], operator: 'Equal', valueText: 'active' },
				}),
			);
		});

		it('should perform BM25 search with tenant', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collection') return 'TestCollection';
					if (parameterName === 'query') return 'keyword search';
					if (parameterName === 'limit') return 10;
					if (parameterName === 'additionalOptions') return { tenant: 'tenant-1' };
					return undefined;
				},
			);

			await bm25Execute.call(executeFunctions, 0);

			expect(mockBm25).toHaveBeenCalledWith(
				'keyword search',
				expect.objectContaining({
					tenant: 'tenant-1',
				}),
			);
		});
	});

	describe('hybrid', () => {
		beforeEach(() => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collection') return 'TestCollection';
					if (parameterName === 'query') return 'hybrid search';
					if (parameterName === 'limit') return 10;
					if (parameterName === 'additionalOptions') return {};
					return undefined;
				},
			);

			mockHybrid.mockResolvedValue({
				objects: [
					{
						uuid: 'uuid-1',
						properties: { title: 'Hybrid Result 1' },
						metadata: { score: 0.85 },
					},
					{
						uuid: 'uuid-2',
						properties: { title: 'Hybrid Result 2' },
						metadata: { score: 0.75 },
					},
				],
			});
		});

		it('should perform hybrid search successfully', async () => {
			const result = await hybridExecute.call(executeFunctions, 0);

			expect(mockHybrid).toHaveBeenCalledWith(
				'hybrid search',
				expect.objectContaining({
					limit: 10,
				}),
			);
			expect(result).toHaveLength(2);
			expect(result[0].json).toMatchObject({
				id: 'uuid-1',
				properties: { title: 'Hybrid Result 1' },
			});
			expect(mockClose).toHaveBeenCalled();
		});

		it('should perform hybrid search with alpha parameter', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collection') return 'TestCollection';
					if (parameterName === 'query') return 'hybrid search';
					if (parameterName === 'limit') return 10;
					if (parameterName === 'additionalOptions') return { alpha: 0.5 };
					return undefined;
				},
			);

			await hybridExecute.call(executeFunctions, 0);

			expect(mockHybrid).toHaveBeenCalledWith(
				'hybrid search',
				expect.objectContaining({
					alpha: 0.5,
				}),
			);
		});

		it('should perform hybrid search with offset', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collection') return 'TestCollection';
					if (parameterName === 'query') return 'hybrid search';
					if (parameterName === 'limit') return 10;
					if (parameterName === 'additionalOptions') return { offset: 5 };
					return undefined;
				},
			);

			await hybridExecute.call(executeFunctions, 0);

			expect(mockHybrid).toHaveBeenCalledWith(
				'hybrid search',
				expect.objectContaining({
					offset: 5,
				}),
			);
		});

		it('should perform hybrid search with returnProperties', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collection') return 'TestCollection';
					if (parameterName === 'query') return 'hybrid search';
					if (parameterName === 'limit') return 10;
					if (parameterName === 'additionalOptions') return { returnProperties: 'name, description' };
					return undefined;
				},
			);

			await hybridExecute.call(executeFunctions, 0);

			expect(mockHybrid).toHaveBeenCalledWith(
				'hybrid search',
				expect.objectContaining({
					returnProperties: ['name', 'description'],
				}),
			);
		});

		it('should perform hybrid search with whereFilter', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collection') return 'TestCollection';
					if (parameterName === 'query') return 'hybrid search';
					if (parameterName === 'limit') return 10;
					if (parameterName === 'additionalOptions')
						return { whereFilter: '{"path": ["type"], "operator": "Equal", "valueText": "article"}' };
					return undefined;
				},
			);

			await hybridExecute.call(executeFunctions, 0);

			expect(mockHybrid).toHaveBeenCalledWith(
				'hybrid search',
				expect.objectContaining({
					where: { path: ['type'], operator: 'Equal', valueText: 'article' },
				}),
			);
		});

		it('should perform hybrid search with includeVector', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collection') return 'TestCollection';
					if (parameterName === 'query') return 'hybrid search';
					if (parameterName === 'limit') return 10;
					if (parameterName === 'additionalOptions') return { includeVector: true };
					return undefined;
				},
			);

			await hybridExecute.call(executeFunctions, 0);

			expect(mockHybrid).toHaveBeenCalledWith(
				'hybrid search',
				expect.objectContaining({
					includeVector: true,
				}),
			);
		});

		it('should perform hybrid search with tenant', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collection') return 'TestCollection';
					if (parameterName === 'query') return 'hybrid search';
					if (parameterName === 'limit') return 10;
					if (parameterName === 'additionalOptions') return { tenant: 'tenant-1' };
					return undefined;
				},
			);

			await hybridExecute.call(executeFunctions, 0);

			expect(mockHybrid).toHaveBeenCalledWith(
				'hybrid search',
				expect.objectContaining({
					tenant: 'tenant-1',
				}),
			);
		});
	});

	describe('nearVector', () => {
		beforeEach(() => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collection') return 'TestCollection';
					if (parameterName === 'queryVector') return '[0.1, 0.2, 0.3, 0.4, 0.5]';
					if (parameterName === 'limit') return 10;
					if (parameterName === 'additionalOptions') return {};
					return undefined;
				},
			);

			mockNearVector.mockResolvedValue({
				objects: [
					{
						uuid: 'uuid-1',
						properties: { title: 'Vector Result 1' },
						metadata: { distance: 0.15 },
					},
				],
			});
		});

		it('should perform nearVector search successfully', async () => {
			const result = await nearVectorExecute.call(executeFunctions, 0);

			expect(mockNearVector).toHaveBeenCalledWith(
				[0.1, 0.2, 0.3, 0.4, 0.5],
				expect.objectContaining({
					limit: 10,
				}),
			);
			expect(result).toHaveLength(1);
			expect(result[0].json).toMatchObject({
				id: 'uuid-1',
				properties: { title: 'Vector Result 1' },
			});
			expect(mockClose).toHaveBeenCalled();
		});

		it('should throw error if vector is not an array', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collection') return 'TestCollection';
					if (parameterName === 'queryVector') return '{"invalid": "vector"}';
					if (parameterName === 'limit') return 10;
					if (parameterName === 'additionalOptions') return {};
					return undefined;
				},
			);

			await expect(nearVectorExecute.call(executeFunctions, 0)).rejects.toThrow(
				'Query vector must be an array of numbers',
			);
			expect(mockClose).toHaveBeenCalled();
		});

		it('should perform nearVector search with certainty', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collection') return 'TestCollection';
					if (parameterName === 'queryVector') return '[0.1, 0.2, 0.3]';
					if (parameterName === 'limit') return 10;
					if (parameterName === 'additionalOptions') return { certainty: 0.8 };
					return undefined;
				},
			);

			await nearVectorExecute.call(executeFunctions, 0);

			expect(mockNearVector).toHaveBeenCalledWith(
				[0.1, 0.2, 0.3],
				expect.objectContaining({
					certainty: 0.8,
				}),
			);
		});

		it('should perform nearVector search with distance', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collection') return 'TestCollection';
					if (parameterName === 'queryVector') return '[0.1, 0.2]';
					if (parameterName === 'limit') return 10;
					if (parameterName === 'additionalOptions') return { distance: 0.2 };
					return undefined;
				},
			);

			await nearVectorExecute.call(executeFunctions, 0);

			expect(mockNearVector).toHaveBeenCalledWith(
				[0.1, 0.2],
				expect.objectContaining({
					distance: 0.2,
				}),
			);
		});

		it('should perform nearVector search with offset', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collection') return 'TestCollection';
					if (parameterName === 'queryVector') return '[0.1, 0.2, 0.3]';
					if (parameterName === 'limit') return 10;
					if (parameterName === 'additionalOptions') return { offset: 2 };
					return undefined;
				},
			);

			await nearVectorExecute.call(executeFunctions, 0);

			expect(mockNearVector).toHaveBeenCalledWith(
				[0.1, 0.2, 0.3],
				expect.objectContaining({
					offset: 2,
				}),
			);
		});

		it('should perform nearVector search with returnProperties', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collection') return 'TestCollection';
					if (parameterName === 'queryVector') return '[0.1, 0.2]';
					if (parameterName === 'limit') return 10;
					if (parameterName === 'additionalOptions') return { returnProperties: 'id, name, score' };
					return undefined;
				},
			);

			await nearVectorExecute.call(executeFunctions, 0);

			expect(mockNearVector).toHaveBeenCalledWith(
				[0.1, 0.2],
				expect.objectContaining({
					returnProperties: ['id', 'name', 'score'],
				}),
			);
		});

		it('should perform nearVector search with whereFilter', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collection') return 'TestCollection';
					if (parameterName === 'queryVector') return '[0.1, 0.2]';
					if (parameterName === 'limit') return 10;
					if (parameterName === 'additionalOptions')
						return { whereFilter: '{"path": ["active"], "operator": "Equal", "valueBoolean": true}' };
					return undefined;
				},
			);

			await nearVectorExecute.call(executeFunctions, 0);

			expect(mockNearVector).toHaveBeenCalledWith(
				[0.1, 0.2],
				expect.objectContaining({
					where: { path: ['active'], operator: 'Equal', valueBoolean: true },
				}),
			);
		});

		it('should perform nearVector search with includeVector', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collection') return 'TestCollection';
					if (parameterName === 'queryVector') return '[0.5, 0.6]';
					if (parameterName === 'limit') return 10;
					if (parameterName === 'additionalOptions') return { includeVector: true };
					return undefined;
				},
			);

			await nearVectorExecute.call(executeFunctions, 0);

			expect(mockNearVector).toHaveBeenCalledWith(
				[0.5, 0.6],
				expect.objectContaining({
					includeVector: true,
				}),
			);
		});

		it('should perform nearVector search with tenant', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collection') return 'TestCollection';
					if (parameterName === 'queryVector') return '[0.1, 0.2]';
					if (parameterName === 'limit') return 10;
					if (parameterName === 'additionalOptions') return { tenant: 'tenant-1' };
					return undefined;
				},
			);

			await nearVectorExecute.call(executeFunctions, 0);

			expect(mockNearVector).toHaveBeenCalledWith(
				[0.1, 0.2],
				expect.objectContaining({
					tenant: 'tenant-1',
				}),
			);
		});
	});
});
