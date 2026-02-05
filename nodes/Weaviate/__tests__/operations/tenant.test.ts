import type { IExecuteFunctions } from 'n8n-workflow';
import { execute as createExecute } from '../../operations/tenant/create';
import { execute as deleteExecute } from '../../operations/tenant/delete';
import { execute as existsExecute } from '../../operations/tenant/exists';
import { execute as listExecute } from '../../operations/tenant/list';

// Mock do cliente Weaviate
const mockClose = jest.fn();
const mockTenantsCreate = jest.fn();
const mockTenantsRemove = jest.fn();
const mockTenantsGet = jest.fn();

const mockCollection = {
	tenants: {
		create: mockTenantsCreate,
		remove: mockTenantsRemove,
		get: mockTenantsGet,
	},
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

describe('Weaviate Tenant Operations', () => {
	let executeFunctions: IExecuteFunctions;

	beforeEach(() => {
		jest.clearAllMocks();

		executeFunctions = {
			getNodeParameter: jest.fn(),
		} as unknown as IExecuteFunctions;
	});

	describe('create', () => {
		beforeEach(() => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collectionName') return 'TestCollection';
					if (parameterName === 'tenantName') return 'tenant-1';
					return undefined;
				},
			);
		});

		it('should create a tenant successfully', async () => {
			const result = await createExecute.call(executeFunctions, 0);

			expect(mockTenantsCreate).toHaveBeenCalledWith({ name: 'tenant-1' });
			expect(result).toHaveLength(1);
			expect(result[0].json).toMatchObject({
				success: true,
				collectionName: 'TestCollection',
				tenantName: 'tenant-1',
			});
			expect(mockClose).toHaveBeenCalled();
		});

		it('should handle resourceLocator format for collection name', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collectionName')
						return { mode: 'list', value: 'TestCollection' };
					if (parameterName === 'tenantName') return 'tenant-1';
					return undefined;
				},
			);

			const result = await createExecute.call(executeFunctions, 0);

			expect(result[0].json.collectionName).toBe('TestCollection');
			expect(mockClose).toHaveBeenCalled();
		});
	});

	describe('delete', () => {
		beforeEach(() => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collectionName') return 'TestCollection';
					if (parameterName === 'tenantName') return 'tenant-1';
					return undefined;
				},
			);
		});

		it('should delete a tenant successfully', async () => {
			const result = await deleteExecute.call(executeFunctions, 0);

			expect(mockTenantsRemove).toHaveBeenCalledWith('tenant-1');
			expect(result).toHaveLength(1);
			expect(result[0].json).toMatchObject({
				success: true,
				collectionName: 'TestCollection',
				tenantName: 'tenant-1',
			});
			expect(mockClose).toHaveBeenCalled();
		});

		it('should handle resourceLocator format', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collectionName')
						return { mode: 'list', value: 'TestCollection' };
					if (parameterName === 'tenantName') return 'tenant-1';
					return undefined;
				},
			);

			const result = await deleteExecute.call(executeFunctions, 0);

			expect(mockTenantsRemove).toHaveBeenCalledWith('tenant-1');
			expect(result[0].json.collectionName).toBe('TestCollection');
			expect(mockClose).toHaveBeenCalled();
		});
	});

	describe('exists', () => {
		beforeEach(() => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collectionName') return 'TestCollection';
					if (parameterName === 'tenantName') return 'tenant-1';
					return undefined;
				},
			);
		});

		it('should check if tenant exists and return true', async () => {
			mockTenantsGet.mockResolvedValue([
				{ name: 'tenant-1', activityStatus: 'ACTIVE' },
				{ name: 'tenant-2', activityStatus: 'ACTIVE' },
			]);

			const result = await existsExecute.call(executeFunctions, 0);

			expect(mockTenantsGet).toHaveBeenCalled();
			expect(result).toHaveLength(1);
			expect(result[0].json).toMatchObject({
				collectionName: 'TestCollection',
				tenantName: 'tenant-1',
				exists: true,
			});
			expect(mockClose).toHaveBeenCalled();
		});

		it('should check if tenant exists and return false', async () => {
			mockTenantsGet.mockResolvedValue([
				{ name: 'tenant-2', activityStatus: 'ACTIVE' },
				{ name: 'tenant-3', activityStatus: 'ACTIVE' },
			]);

			const result = await existsExecute.call(executeFunctions, 0);

			expect(result[0].json.exists).toBe(false);
			expect(mockClose).toHaveBeenCalled();
		});

		it('should handle single tenant response', async () => {
			mockTenantsGet.mockResolvedValue({ name: 'tenant-1', activityStatus: 'ACTIVE' });

			const result = await existsExecute.call(executeFunctions, 0);

			expect(result[0].json.exists).toBe(true);
			expect(mockClose).toHaveBeenCalled();
		});
	});

	describe('list', () => {
		beforeEach(() => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'collectionName') return 'TestCollection';
					return undefined;
				},
			);
		});

		it('should list all tenants', async () => {
			mockTenantsGet.mockResolvedValue([
				{ name: 'tenant-1', activityStatus: 'ACTIVE' },
				{ name: 'tenant-2', activityStatus: 'INACTIVE' },
				{ name: 'tenant-3', activityStatus: 'ACTIVE' },
			]);

			const result = await listExecute.call(executeFunctions, 0);

			expect(mockTenantsGet).toHaveBeenCalled();
			expect(result).toHaveLength(3);
			expect(result[0].json).toMatchObject({
				collectionName: 'TestCollection',
				name: 'tenant-1',
				activityStatus: 'ACTIVE',
			});
			expect(result[1].json).toMatchObject({
				name: 'tenant-2',
				activityStatus: 'INACTIVE',
			});
			expect(mockClose).toHaveBeenCalled();
		});

		it('should handle empty tenant list', async () => {
			mockTenantsGet.mockResolvedValue([]);

			const result = await listExecute.call(executeFunctions, 0);

			expect(result).toHaveLength(0);
			expect(mockClose).toHaveBeenCalled();
		});

		it('should use pairedItem for each tenant', async () => {
			mockTenantsGet.mockResolvedValue([
				{ name: 'tenant-1', activityStatus: 'ACTIVE' },
			]);

			const result = await listExecute.call(executeFunctions, 0);

			expect(result[0].pairedItem).toEqual({ item: 0 });
		});
	});
});
