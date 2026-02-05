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
			const result = await execute.call(executeFunctions, 0);

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

			await expect(execute.call(executeFunctions, 0)).rejects.toThrow();
			expect(mockClose).toHaveBeenCalled();
		});

		it('should close client even if creation fails', async () => {
			mockCollectionsCreate.mockRejectedValue(new Error('Creation failed'));

			await expect(execute.call(executeFunctions, 0)).rejects.toThrow('Creation failed');
			expect(mockClose).toHaveBeenCalled();
		});
	});
});
