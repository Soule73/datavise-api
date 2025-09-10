import widgetService from '../../src/services/widgetService';
import Widget from '../../src/models/Widget';
import User from '../../src/models/User';
import Role from '../../src/models/Role';
import Dashboard from '../../src/models/Dashboard';
import DataSource from '../../src/models/DataSource';
import { ApiError, ApiSuccess } from '../../src/types/api';

const isApiSuccess = <T>(response: ApiSuccess<T> | ApiError): response is ApiSuccess<T> => {
    return response.success === true;
};

const isApiError = (response: ApiSuccess<any> | ApiError): response is ApiError => {
    return response.success === false;
};

describe('Widget Service', () => {
    let testUser: { user: any };
    let testDashboard: any;
    let testDataSource: any;

    beforeEach(async () => {

        // Create test role
        const testRole = await Role.create({
            roleId: 'test-role',
            name: 'Test Role',
            permissions: []
        });

        // Create test user
        const userDoc = await User.create({
            userId: 'test-user-widget',
            username: 'testuser',
            email: 'test@example.com',
            password: 'hashedpassword',
            role: testRole._id,
            roleId: testRole._id,
            verified: true,
            enabled: true
        }); testUser = { user: userDoc };

        // Create test dashboard
        testDashboard = await Dashboard.create({
            dashboardId: 'test-dashboard-widget',
            title: 'Test Dashboard',
            widgets: [],
            userId: testUser.user._id,
            ownerId: testUser.user._id,
            visibility: 'private',
            layout: []
        });

        // Create test data source
        testDataSource = await DataSource.create({
            sourceId: 'test-source-widget',
            name: 'test-datasource',
            type: 'csv',
            config: { path: 'test-path' },
            userId: testUser.user._id,
            ownerId: testUser.user._id
        });
    });

    describe('list', () => {
        it('should return empty array when user has no widgets', async () => {
            const response = await widgetService.list((testUser.user as any)._id);

            expect(isApiSuccess(response)).toBe(true);
            if (isApiSuccess(response)) {
                expect(response.data).toEqual([]);
            }
        });

        it('should return user widgets', async () => {
            // Create test widget
            await Widget.create({
                widgetId: 'widget-test-1',
                title: 'Test Widget',
                type: 'chart',
                config: { chartType: 'bar' },
                dataSourceId: testDataSource._id,
                ownerId: testUser.user._id
            });

            const response = await widgetService.list((testUser.user as any)._id);

            expect(isApiSuccess(response)).toBe(true);
            if (isApiSuccess(response)) {
                expect(response.data).toHaveLength(1);
                expect((response.data as any)[0]).toHaveProperty('widgetId', 'widget-test-1');
                expect((response.data as any)[0]).toHaveProperty('title', 'Test Widget');
            }
        });
    });

    describe('getById', () => {
        it('should return widget by id', async () => {
            const widget = await Widget.create({
                widgetId: 'widget-test-get',
                title: 'Test Widget Get',
                type: 'chart',
                config: { chartType: 'line' },
                dataSourceId: testDataSource._id,
                ownerId: testUser.user._id
            });

            const response = await widgetService.getById(widget._id.toString());

            expect(isApiSuccess(response)).toBe(true);
            if (isApiSuccess(response)) {
                expect(response.data).toHaveProperty('widgetId', 'widget-test-get');
                expect(response.data).toHaveProperty('title', 'Test Widget Get');
                expect(response.data).toHaveProperty('type', 'chart');
            }
        });

        it('should return error for non-existent widget', async () => {
            const response = await widgetService.getById('507f1f77bcf86cd799439011');

            expect(isApiError(response)).toBe(true);
            if (isApiError(response)) {
                expect(response.message).toBe('Widget non trouvé.');
            }
        });
    });

    describe('create', () => {
        it('should create widget successfully', async () => {
            const widgetData = {
                widgetId: 'test-widget-create',
                title: 'New Test Widget',
                type: 'chart' as const,
                config: { chartType: 'pie' },
                dataSourceId: testDataSource._id,
                userId: (testUser.user as any)._id
            };

            const response = await widgetService.create(widgetData);

            expect(isApiSuccess(response)).toBe(true);
            if (isApiSuccess(response)) {
                expect(response.data).toHaveProperty('title', 'New Test Widget');
                expect(response.data).toHaveProperty('type', 'chart');
                expect(response.data).toHaveProperty('widgetId');
            }
        });
    });

    describe('update', () => {
        it('should update widget successfully', async () => {
            const widget = await Widget.create({
                widgetId: 'widget-test-update',
                title: 'Original Title',
                type: 'chart',
                config: { chartType: 'bar' },
                dataSourceId: testDataSource._id,
                ownerId: testUser.user._id
            });

            const updateData = {
                title: 'Updated Title',
                config: { chartType: 'line' },
                userId: (testUser.user as any)._id
            };

            const response = await widgetService.update(widget._id.toString(), updateData);

            expect(isApiSuccess(response)).toBe(true);
            if (isApiSuccess(response)) {
                expect(response.data).toHaveProperty('title', 'Updated Title');
                expect((response.data as any).config).toHaveProperty('chartType', 'line');
            }
        });

        it('should return error for non-existent widget', async () => {
            const updateData = {
                title: 'Updated Title'
            };

            const response = await widgetService.update('507f1f77bcf86cd799439011', updateData);

            expect(isApiError(response)).toBe(true);
            if (isApiError(response)) {
                expect(response.message).toBe('Widget non trouvé.');
            }
        });
    });

    describe('remove', () => {
        it('should delete widget successfully', async () => {
            const widget = await Widget.create({
                widgetId: 'widget-test-delete',
                title: 'To Delete',
                type: 'chart',
                config: { chartType: 'bar' },
                dataSourceId: testDataSource._id,
                ownerId: testUser.user._id
            });

            const response = await widgetService.remove(widget._id.toString());

            expect(isApiSuccess(response)).toBe(true);
            if (isApiSuccess(response)) {
                expect(response.data).toBe('Widget supprimé avec succès.');
            }

            // Verify widget is deleted
            const deletedWidget = await Widget.findById(widget._id);
            expect(deletedWidget).toBeNull();
        });

        it('should return error for non-existent widget', async () => {
            const response = await widgetService.remove('507f1f77bcf86cd799439011');

            expect(isApiError(response)).toBe(true);
            if (isApiError(response)) {
                expect(response.message).toBe('Widget non trouvé.');
            }
        });
    });
});
