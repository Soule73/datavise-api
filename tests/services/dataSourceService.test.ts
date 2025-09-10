import mongoose from 'mongoose';
import DataSource from '../../src/models/DataSource';
import Widget from '../../src/models/Widget';
import dataSourceService from '../../src/services/dataSourceService';
import { createTestUser } from '../helpers/testHelpers';
import { initPermissionsAndRoles } from '../../src/data/initPermissions';

// Type guard helper functions
function isApiSuccess<T>(result: any): result is { success: true; data: T; message?: string } {
    return result.success === true;
}

function isApiError(result: any): result is { success: false; message: string; statusCode?: number; errors?: any } {
    return result.success === false;
}

// Helper function to create a test data source directly in database
async function createTestDataSource(overrides: any = {}) {
    const testUser = await createTestUser({ email: 'datasource-owner@example.com', roleName: 'user' });
    return await DataSource.create({
        name: 'Test Source',
        type: 'json',
        endpoint: 'https://api.example.com/data',
        visibility: 'private',
        ownerId: testUser.user._id,
        ...overrides
    });
}

describe('DataSource Service', () => {
    beforeEach(async () => {
        await initPermissionsAndRoles();
    });

    describe('list', () => {
        it('should return empty array when no sources exist', async () => {
            const result = await dataSourceService.list();

            expect(result.success).toBe(true);
            if (isApiSuccess(result)) {
                expect(result.data).toEqual([]);
                expect(result.message).toBe('Sources récupérées avec succès');
            }
        });

        it('should return sources with isUsed flag', async () => {
            // Create test user first
            const testUser = await createTestUser({ email: 'testuser@example.com', roleName: 'user' });

            // Create test sources directly in database
            const source1 = await DataSource.create({
                name: 'Test Source 1',
                type: 'json',
                endpoint: 'https://api.example.com/data1',
                visibility: 'private',
                ownerId: testUser.user._id
            });

            const source2 = await DataSource.create({
                name: 'Test Source 2',
                type: 'csv',
                endpoint: 'https://api.example.com/data2.csv',
                visibility: 'private',
                ownerId: testUser.user._id
            });

            // Create a widget that uses source1
            await Widget.create({
                widgetId: 'widget-1',
                title: 'Test Widget',
                type: 'chart',
                dataSourceId: source1._id,
                ownerId: testUser.user._id,
                visibility: 'private'
            });

            const result = await dataSourceService.list();

            expect(result.success).toBe(true);
            if (isApiSuccess(result)) {
                expect(result.data).toHaveLength(2);

                const source1Result = result.data.find(s => s.name === 'Test Source 1');
                const source2Result = result.data.find(s => s.name === 'Test Source 2');

                expect(source1Result?.isUsed).toBe(true);
                expect(source2Result?.isUsed).toBe(false);
            }
        });
    });



    describe('getById', () => {
        it('should return source with isUsed flag', async () => {
            const source = await createTestDataSource();

            const result = await dataSourceService.getById(source._id.toString());

            expect(result.success).toBe(true);
            if (isApiSuccess(result)) {
                expect(result.data.name).toBe('Test Source');
                expect(result.data.isUsed).toBe(false);
            }
        });

        it('should return error for non-existent source', async () => {
            const fakeId = new mongoose.Types.ObjectId().toString();
            const result = await dataSourceService.getById(fakeId);

            expect(result.success).toBe(false);
            if (isApiError(result)) {
                expect(result.message).toBe('Source non trouvée.');
            }
        });
    });

    describe('update', () => {
        it('should update source successfully', async () => {
            const source = await createTestDataSource({
                name: 'Original Name'
            });

            const updatePayload = {
                name: 'Updated Name',
                type: 'json' as const,
                endpoint: 'https://api.example.com/updated-data',
                visibility: 'private' as const
            };

            const result = await dataSourceService.update(source._id.toString(), updatePayload);

            expect(result.success).toBe(true);
            if (isApiSuccess(result)) {
                expect(result.data.name).toBe('Updated Name');
                expect(result.data.endpoint).toBe('https://api.example.com/updated-data');
            }
        });

        it('should return error for non-existent source', async () => {
            const fakeId = new mongoose.Types.ObjectId().toString();
            const updatePayload = {
                name: 'Updated Name',
                type: 'json' as const,
                endpoint: 'https://api.example.com/data',
                visibility: 'private' as const
            };

            const result = await dataSourceService.update(fakeId, updatePayload);

            expect(result.success).toBe(false);
            if (isApiError(result)) {
                expect(result.message).toBe('Source non trouvée');
            }
        });
    });

    describe('remove', () => {
        it('should remove unused source successfully', async () => {
            const source = await createTestDataSource();

            const result = await dataSourceService.remove(source._id.toString());

            expect(result.success).toBe(true);
            if (isApiSuccess(result)) {
                expect(result.data.message).toBe('Source supprimée.');
            }

            // Verify it was deleted
            const deleted = await DataSource.findById(source._id);
            expect(deleted).toBeNull();
        });

        it('should not remove source used by widget', async () => {
            const source = await createTestDataSource({
                name: 'Used Source'
            });

            const testUser = await createTestUser({ email: 'remove-test@example.com', roleName: 'user' });
            await Widget.create({
                widgetId: 'widget-1',
                title: 'Test Widget',
                type: 'chart',
                dataSourceId: source._id,
                ownerId: testUser.user._id,
                visibility: 'private'
            });

            const result = await dataSourceService.remove(source._id.toString());

            expect(result.success).toBe(false);
            if (isApiError(result)) {
                expect(result.message).toBe('Impossible de supprimer une source utilisée par au moins un widget.');
            }

            // Verify it was not deleted
            const stillExists = await DataSource.findById(source._id);
            expect(stillExists).toBeTruthy();
        });

        it('should return error for non-existent source', async () => {
            const fakeId = new mongoose.Types.ObjectId().toString();
            const result = await dataSourceService.remove(fakeId);

            expect(result.success).toBe(false);
            if (isApiError(result)) {
                expect(result.message).toBe('Source non trouvée.');
            }
        });
    });

    describe('detectColumns', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should detect columns from JSON endpoint', async () => {
            // Mock fetchRowsFromSource to return test data
            const mockData = [
                { id: 1, name: 'John', age: 30, active: true, created: '2023-01-01' },
                { id: 2, name: 'Jane', age: 25, active: false, created: '2023-01-02' }
            ];

            const dataSourceUtils = require('../../src/utils/dataSourceUtils');
            const spy = jest.spyOn(dataSourceUtils, 'fetchRowsFromSource')
                .mockResolvedValue(mockData);

            const params = {
                type: 'json' as const,
                endpoint: 'https://api.example.com/data'
            };

            const result = await dataSourceService.detectColumns(params);

            expect(result.success).toBe(true);
            if (isApiSuccess(result)) {
                expect(result.data.columns).toEqual(['id', 'name', 'age', 'active', 'created']);
                expect(result.data.preview).toHaveLength(2);
                expect(result.data.types).toEqual({
                    id: 'integer',
                    name: 'string',
                    age: 'integer',
                    active: 'boolean',
                    created: 'date'
                });
            }

            spy.mockRestore();
        });

        it('should handle empty data source', async () => {
            const dataSourceUtils = require('../../src/utils/dataSourceUtils');
            const spy = jest.spyOn(dataSourceUtils, 'fetchRowsFromSource')
                .mockResolvedValue([]);

            const params = {
                type: 'json' as const,
                endpoint: 'https://api.example.com/empty'
            };

            const result = await dataSourceService.detectColumns(params);

            expect(result.success).toBe(false);
            if (isApiError(result)) {
                expect(result.message).toBe('Impossible de lire la source pour détecter les colonnes.');
            }

            spy.mockRestore();
        });

        it('should handle detection errors', async () => {
            const dataSourceUtils = require('../../src/utils/dataSourceUtils');
            const spy = jest.spyOn(dataSourceUtils, 'fetchRowsFromSource')
                .mockRejectedValue(new Error('Network error'));

            const params = {
                type: 'json' as const,
                endpoint: 'https://api.example.com/error'
            };

            const result = await dataSourceService.detectColumns(params);

            expect(result.success).toBe(false);
            if (isApiError(result)) {
                expect(result.message).toBe('Network error');
            }

            spy.mockRestore();
        });
    });

    describe('fetchData', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should fetch data successfully', async () => {
            const source = await createTestDataSource();

            const mockData = [
                { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' },
                { id: 3, name: 'Item 3' }
            ];

            // Mock loadRows function
            const dataSourceUtils = require('../../src/utils/dataSourceUtils');
            const spy = jest.spyOn(dataSourceUtils, 'loadRows')
                .mockResolvedValue(mockData);

            const result = await dataSourceService.fetchData(source._id.toString());

            expect(result.success).toBe(true);
            if (isApiSuccess(result)) {
                expect(result.data).toEqual(mockData);
                expect(result.message).toBe('Données récupérées avec succès');
            }

            spy.mockRestore();
        });

        it('should handle pagination', async () => {
            const source = await createTestDataSource();

            const mockData = Array.from({ length: 10 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` }));

            const dataSourceUtils = require('../../src/utils/dataSourceUtils');
            const spy = jest.spyOn(dataSourceUtils, 'loadRows')
                .mockResolvedValue(mockData);

            const result = await dataSourceService.fetchData(source._id.toString(), {
                page: 1,
                pageSize: 5
            });

            expect(result.success).toBe(true);
            if (isApiSuccess(result)) {
                expect(result.data).toHaveLength(5);
                expect((result as any).total).toBe(10);
            }

            spy.mockRestore();
        });

        it('should return error for non-existent source', async () => {
            const fakeId = new mongoose.Types.ObjectId().toString();
            const result = await dataSourceService.fetchData(fakeId);

            expect(result.success).toBe(false);
            if (isApiError(result)) {
                expect(result.message).toBe('Source non trouvée.');
            }
        });

        it('should handle fetch errors', async () => {
            const source = await createTestDataSource();

            const dataSourceUtils = require('../../src/utils/dataSourceUtils');
            const spy = jest.spyOn(dataSourceUtils, 'loadRows')
                .mockRejectedValue(new Error('Network error'));

            const result = await dataSourceService.fetchData(source._id.toString());

            expect(result.success).toBe(false);
            if (isApiError(result)) {
                expect(result.message).toBe('Network error');
            }

            spy.mockRestore();
        });
    });
});
