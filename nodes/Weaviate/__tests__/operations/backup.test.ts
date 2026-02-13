/* eslint-disable @typescript-eslint/no-unused-vars */
import type { IExecuteFunctions } from 'n8n-workflow';
import { execute as createExecute } from '../../operations/backup/create';
import { execute as getCreateStatusExecute } from '../../operations/backup/getCreateStatus';
import { execute as getRestoreStatusExecute } from '../../operations/backup/getRestoreStatus';
import { execute as listExecute } from '../../operations/backup/list';
import { execute as restoreExecute } from '../../operations/backup/restore';

// Mock do cliente Weaviate
const mockClose = jest.fn();
const mockCreate = jest.fn();
const mockGetCreateStatus = jest.fn();
const mockGetRestoreStatus = jest.fn();
const mockList = jest.fn();
const mockRestore = jest.fn();

const mockBackup = {
	create: mockCreate,
	getCreateStatus: mockGetCreateStatus,
	getRestoreStatus: mockGetRestoreStatus,
	list: mockList,
	restore: mockRestore,
};

jest.mock('../../helpers/client', () => ({
	getWeaviateClient: jest.fn(async function (this: IExecuteFunctions) {
		return {
			backup: mockBackup,
			close: mockClose,
		};
	}),
}));

describe('Weaviate Backup Operations', () => {
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
				(parameterName: string, itemIndex: number, defaultValue?: unknown) => {
					if (parameterName === 'backend') return 'filesystem';
					if (parameterName === 'backupId') return 'backup-123';
					if (parameterName === 'includeCollections') return '';
					if (parameterName === 'excludeCollections') return '';
					if (parameterName === 'waitForCompletion') return defaultValue !== undefined ? defaultValue : true;
					return undefined;
				},
			);

			mockCreate.mockResolvedValue({
				status: 'SUCCESS',
				backend: 'filesystem',
				id: 'backup-123',
				path: '/backups/backup-123',
			});
		});

		it('should create a backup successfully', async () => {
			const result = await createExecute.call(executeFunctions, 0);

			expect(mockCreate).toHaveBeenCalledWith({
				backend: 'filesystem',
				backupId: 'backup-123',
				includeCollections: undefined,
				excludeCollections: undefined,
				waitForCompletion: true,
			});
			expect(result).toHaveLength(1);
			expect(result[0].json).toMatchObject({
				success: true,
				backupId: 'backup-123',
				backend: 'filesystem',
				status: 'SUCCESS',
			});
			expect(mockClose).toHaveBeenCalled();
		});

		it('should create backup with includeCollections', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string, itemIndex: number, defaultValue?: unknown) => {
					if (parameterName === 'backend') return 'filesystem';
					if (parameterName === 'backupId') return 'backup-123';
					if (parameterName === 'includeCollections') return 'Collection1, Collection2, Collection3';
					if (parameterName === 'excludeCollections') return '';
					if (parameterName === 'waitForCompletion') return defaultValue !== undefined ? defaultValue : true;
					return undefined;
				},
			);

			await createExecute.call(executeFunctions, 0);

			expect(mockCreate).toHaveBeenCalledWith({
				backend: 'filesystem',
				backupId: 'backup-123',
				includeCollections: ['Collection1', 'Collection2', 'Collection3'],
				excludeCollections: undefined,
				waitForCompletion: true,
			});
		});

		it('should create backup with excludeCollections', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string, itemIndex: number, defaultValue?: unknown) => {
					if (parameterName === 'backend') return 'filesystem';
					if (parameterName === 'backupId') return 'backup-456';
					if (parameterName === 'includeCollections') return '';
					if (parameterName === 'excludeCollections') return 'TempCollection, CacheCollection';
					if (parameterName === 'waitForCompletion') return defaultValue !== undefined ? defaultValue : true;
					return undefined;
				},
			);

			await createExecute.call(executeFunctions, 0);

			expect(mockCreate).toHaveBeenCalledWith({
				backend: 'filesystem',
				backupId: 'backup-456',
				includeCollections: undefined,
				excludeCollections: ['TempCollection', 'CacheCollection'],
				waitForCompletion: true,
			});
		});

		it('should create backup without waiting for completion', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string, itemIndex: number, defaultValue?: unknown) => {
					if (parameterName === 'backend') return 'filesystem';
					if (parameterName === 'backupId') return 'backup-789';
					if (parameterName === 'includeCollections') return '';
					if (parameterName === 'excludeCollections') return '';
					if (parameterName === 'waitForCompletion') return false;
					return undefined;
				},
			);

			mockCreate.mockResolvedValue({
				status: 'STARTED',
				backend: 'filesystem',
				id: 'backup-789',
			});

			const result = await createExecute.call(executeFunctions, 0);

			expect(mockCreate).toHaveBeenCalledWith({
				backend: 'filesystem',
				backupId: 'backup-789',
				includeCollections: undefined,
				excludeCollections: undefined,
				waitForCompletion: false,
			});
			expect(result[0].json.status).toBe('STARTED');
		});

		it('should create backup with both include and exclude collections', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string, itemIndex: number, defaultValue?: unknown) => {
					if (parameterName === 'backend') return 's3';
					if (parameterName === 'backupId') return 'backup-mixed';
					if (parameterName === 'includeCollections') return 'Important1, Important2';
					if (parameterName === 'excludeCollections') return 'Temp1, Temp2';
					if (parameterName === 'waitForCompletion') return defaultValue !== undefined ? defaultValue : true;
					return undefined;
				},
			);

			await createExecute.call(executeFunctions, 0);

			expect(mockCreate).toHaveBeenCalledWith({
				backend: 's3',
				backupId: 'backup-mixed',
				includeCollections: ['Important1', 'Important2'],
				excludeCollections: ['Temp1', 'Temp2'],
				waitForCompletion: true,
			});
		});
	});

	describe('getCreateStatus', () => {
		beforeEach(() => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'backend') return 'filesystem';
					if (parameterName === 'backupId') return 'backup-123';
					return undefined;
				},
			);

			mockGetCreateStatus.mockResolvedValue({
				status: 'SUCCESS',
				backend: 'filesystem',
				id: 'backup-123',
				path: '/backups/backup-123',
			});
		});

		it('should get backup creation status successfully', async () => {
			const result = await getCreateStatusExecute.call(executeFunctions, 0);

			expect(mockGetCreateStatus).toHaveBeenCalledWith({
				backend: 'filesystem',
				backupId: 'backup-123',
			});
			expect(result).toHaveLength(1);
			expect(result[0].json).toMatchObject({
				backupId: 'backup-123',
				backend: 'filesystem',
				status: 'SUCCESS',
			});
			expect(mockClose).toHaveBeenCalled();
		});

		it('should get in-progress backup status', async () => {
			mockGetCreateStatus.mockResolvedValue({
				status: 'TRANSFERRING',
				backend: 'filesystem',
				id: 'backup-123',
			});

			const result = await getCreateStatusExecute.call(executeFunctions, 0);

			expect(result[0].json.status).toBe('TRANSFERRING');
		});

		it('should get failed backup status', async () => {
			mockGetCreateStatus.mockResolvedValue({
				status: 'FAILED',
				backend: 'filesystem',
				id: 'backup-123',
				error: 'Insufficient storage space',
			});

			const result = await getCreateStatusExecute.call(executeFunctions, 0);

			expect(result[0].json.status).toBe('FAILED');
			expect(result[0].json.result).toHaveProperty('error');
		});
	});

	describe('getRestoreStatus', () => {
		beforeEach(() => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'backend') return 'filesystem';
					if (parameterName === 'backupId') return 'backup-123';
					return undefined;
				},
			);

			mockGetRestoreStatus.mockResolvedValue({
				status: 'SUCCESS',
				backend: 'filesystem',
				id: 'backup-123',
			});
		});

		it('should get backup restore status successfully', async () => {
			const result = await getRestoreStatusExecute.call(executeFunctions, 0);

			expect(mockGetRestoreStatus).toHaveBeenCalledWith({
				backend: 'filesystem',
				backupId: 'backup-123',
			});
			expect(result).toHaveLength(1);
			expect(result[0].json).toMatchObject({
				backupId: 'backup-123',
				backend: 'filesystem',
				status: 'SUCCESS',
			});
			expect(mockClose).toHaveBeenCalled();
		});

		it('should get in-progress restore status', async () => {
			mockGetRestoreStatus.mockResolvedValue({
				status: 'TRANSFERRING',
				backend: 'filesystem',
				id: 'backup-123',
			});

			const result = await getRestoreStatusExecute.call(executeFunctions, 0);

			expect(result[0].json.status).toBe('TRANSFERRING');
		});

		it('should get failed restore status', async () => {
			mockGetRestoreStatus.mockResolvedValue({
				status: 'FAILED',
				backend: 'filesystem',
				id: 'backup-123',
				error: 'Backup file corrupted',
			});

			const result = await getRestoreStatusExecute.call(executeFunctions, 0);

			expect(result[0].json.status).toBe('FAILED');
			expect(result[0].json.result).toHaveProperty('error');
		});
	});

	describe('list', () => {
		beforeEach(() => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'backend') return 'filesystem';
					return undefined;
				},
			);
		});

		it('should list backups successfully', async () => {
			mockList.mockResolvedValue([
				{
					id: 'backup-1',
					status: 'SUCCESS',
					path: '/backups/backup-1',
				},
				{
					id: 'backup-2',
					status: 'SUCCESS',
					path: '/backups/backup-2',
				},
				{
					id: 'backup-3',
					status: 'SUCCESS',
					path: '/backups/backup-3',
				},
			]);

			const result = await listExecute.call(executeFunctions, 0);

			expect(mockList).toHaveBeenCalledWith('filesystem');
			expect(result).toHaveLength(3);
			expect(result[0].json).toMatchObject({
				backend: 'filesystem',
				id: 'backup-1',
				status: 'SUCCESS',
			});
			expect(result[1].json.id).toBe('backup-2');
			expect(result[2].json.id).toBe('backup-3');
			expect(mockClose).toHaveBeenCalled();
		});

		it('should handle single backup as object', async () => {
			mockList.mockResolvedValue({
				id: 'backup-1',
				status: 'SUCCESS',
				path: '/backups/backup-1',
			});

			const result = await listExecute.call(executeFunctions, 0);

			expect(result).toHaveLength(1);
			expect(result[0].json.id).toBe('backup-1');
		});

		it('should handle empty backup list', async () => {
			mockList.mockResolvedValue([]);

			const result = await listExecute.call(executeFunctions, 0);

			expect(result).toHaveLength(1);
			expect(result[0].json).toMatchObject({
				backend: 'filesystem',
				message: 'No backups found',
				backups: [],
			});
		});

		it('should list backups from different backend', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string) => {
					if (parameterName === 'backend') return 's3';
					return undefined;
				},
			);

			mockList.mockResolvedValue([
				{
					id: 'backup-s3-1',
					status: 'SUCCESS',
					path: 's3://bucket/backups/backup-s3-1',
				},
			]);

			const result = await listExecute.call(executeFunctions, 0);

			expect(mockList).toHaveBeenCalledWith('s3');
			expect(result[0].json.backend).toBe('s3');
		});
	});

	describe('restore', () => {
		beforeEach(() => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string, itemIndex: number, defaultValue?: unknown) => {
					if (parameterName === 'backend') return 'filesystem';
					if (parameterName === 'backupId') return 'backup-123';
					if (parameterName === 'includeCollections') return '';
					if (parameterName === 'excludeCollections') return '';
					if (parameterName === 'waitForCompletion') return defaultValue !== undefined ? defaultValue : true;
					return undefined;
				},
			);

			mockRestore.mockResolvedValue({
				status: 'SUCCESS',
				backend: 'filesystem',
				id: 'backup-123',
			});
		});

		it('should restore a backup successfully', async () => {
			const result = await restoreExecute.call(executeFunctions, 0);

			expect(mockRestore).toHaveBeenCalledWith({
				backend: 'filesystem',
				backupId: 'backup-123',
				includeCollections: undefined,
				excludeCollections: undefined,
				waitForCompletion: true,
			});
			expect(result).toHaveLength(1);
			expect(result[0].json).toMatchObject({
				success: true,
				backupId: 'backup-123',
				backend: 'filesystem',
				status: 'SUCCESS',
			});
			expect(mockClose).toHaveBeenCalled();
		});

		it('should restore backup with includeCollections', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string, itemIndex: number, defaultValue?: unknown) => {
					if (parameterName === 'backend') return 'filesystem';
					if (parameterName === 'backupId') return 'backup-123';
					if (parameterName === 'includeCollections') return 'Collection1, Collection2';
					if (parameterName === 'excludeCollections') return '';
					if (parameterName === 'waitForCompletion') return defaultValue !== undefined ? defaultValue : true;
					return undefined;
				},
			);

			await restoreExecute.call(executeFunctions, 0);

			expect(mockRestore).toHaveBeenCalledWith({
				backend: 'filesystem',
				backupId: 'backup-123',
				includeCollections: ['Collection1', 'Collection2'],
				excludeCollections: undefined,
				waitForCompletion: true,
			});
		});

		it('should restore backup with excludeCollections', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string, itemIndex: number, defaultValue?: unknown) => {
					if (parameterName === 'backend') return 'filesystem';
					if (parameterName === 'backupId') return 'backup-456';
					if (parameterName === 'includeCollections') return '';
					if (parameterName === 'excludeCollections') return 'TempData, OldLogs';
					if (parameterName === 'waitForCompletion') return defaultValue !== undefined ? defaultValue : true;
					return undefined;
				},
			);

			await restoreExecute.call(executeFunctions, 0);

			expect(mockRestore).toHaveBeenCalledWith({
				backend: 'filesystem',
				backupId: 'backup-456',
				includeCollections: undefined,
				excludeCollections: ['TempData', 'OldLogs'],
				waitForCompletion: true,
			});
		});

		it('should restore backup without waiting for completion', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string, itemIndex: number, defaultValue?: unknown) => {
					if (parameterName === 'backend') return 'filesystem';
					if (parameterName === 'backupId') return 'backup-789';
					if (parameterName === 'includeCollections') return '';
					if (parameterName === 'excludeCollections') return '';
					if (parameterName === 'waitForCompletion') return false;
					return undefined;
				},
			);

			mockRestore.mockResolvedValue({
				status: 'STARTED',
				backend: 'filesystem',
				id: 'backup-789',
			});

			const result = await restoreExecute.call(executeFunctions, 0);

			expect(mockRestore).toHaveBeenCalledWith({
				backend: 'filesystem',
				backupId: 'backup-789',
				includeCollections: undefined,
				excludeCollections: undefined,
				waitForCompletion: false,
			});
			expect(result[0].json.status).toBe('STARTED');
		});

		it('should restore backup with both include and exclude collections', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(parameterName: string, itemIndex: number, defaultValue?: unknown) => {
					if (parameterName === 'backend') return 's3';
					if (parameterName === 'backupId') return 'backup-selective';
					if (parameterName === 'includeCollections') return 'UserData, Products';
					if (parameterName === 'excludeCollections') return 'Analytics, Logs';
					if (parameterName === 'waitForCompletion') return defaultValue !== undefined ? defaultValue : true;
					return undefined;
				},
			);

			await restoreExecute.call(executeFunctions, 0);

			expect(mockRestore).toHaveBeenCalledWith({
				backend: 's3',
				backupId: 'backup-selective',
				includeCollections: ['UserData', 'Products'],
				excludeCollections: ['Analytics', 'Logs'],
				waitForCompletion: true,
			});
		});
	});
});
