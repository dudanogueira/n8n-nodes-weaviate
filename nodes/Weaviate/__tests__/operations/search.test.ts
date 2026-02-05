import type { IExecuteFunctions } from 'n8n-workflow';
import { execute as nearTextExecute } from '../../operations/search/nearText';
import { execute as bm25Execute } from '../../operations/search/bm25';

// Mock do cliente Weaviate
const mockClose = jest.fn();
const mockNearText = jest.fn();
const mockBm25 = jest.fn();

const mockQuery = {
	nearText: mockNearText,
	bm25: mockBm25,
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
	});
});
