import mongoose from 'mongoose';
import Dashboard from '../../src/models/Dashboard';
import dashboardService from '../../src/services/dashboardService';
import { createTestUser } from '../helpers/testHelpers';
import { initPermissionsAndRoles } from '../../src/data/initPermissions';

// Type guard helper functions
function isApiSuccess<T>(result: any): result is { success: true; data: T; message?: string } {
    return result.success === true;
}

function isApiError(result: any): result is { success: false; message: string; statusCode?: number; errors?: any } {
    return result.success === false;
}

describe('Dashboard Service', () => {
    beforeEach(async () => {
        await initPermissionsAndRoles();
    });

    describe('listUserDashboards', () => {
        it('should return empty array when user has no dashboards', async () => {
            const testUser = await createTestUser({ email: 'testuser@example.com', roleName: 'user' });
            const result = await dashboardService.listUserDashboards((testUser.user as any)._id.toString());

            expect(result.success).toBe(true);
            if (isApiSuccess(result)) {
                expect(result.data).toEqual([]);
            }
        });

        it('should return user dashboards', async () => {
            const testUser = await createTestUser({ email: 'testuser@example.com', roleName: 'user' });
            const userId = (testUser.user as any)._id.toString();

            // Create test dashboard
            await Dashboard.create({
                dashboardId: 'dashboard-1',
                title: 'Dashboard 1',
                widgets: [],
                ownerId: (testUser.user as any)._id,
                visibility: 'private',
                layout: []
            });

            const result = await dashboardService.listUserDashboards(userId);

            expect(result.success).toBe(true);
            if (isApiSuccess(result)) {
                expect(result.data).toHaveLength(1);
                expect(result.data[0].title).toBe('Dashboard 1');
            }
        });
    });

    describe('getDashboardById', () => {
        it('should return dashboard by id', async () => {
            const testUser = await createTestUser({ email: 'dashboard-owner@example.com', roleName: 'user' });

            const dashboard = await Dashboard.create({
                dashboardId: 'dashboard-test-1',
                title: 'Test Dashboard',
                widgets: [],
                userId: (testUser.user as any)._id,
                ownerId: (testUser.user as any)._id,
                visibility: 'private',
                layout: []
            });

            const result = await dashboardService.getDashboardById((dashboard as any)._id.toString());

            expect(result.success).toBe(true);
            if (isApiSuccess(result)) {
                expect(result.data.title).toBe('Test Dashboard');
            }
        });

        it('should return error for non-existent dashboard', async () => {
            const fakeId = new mongoose.Types.ObjectId().toString();
            const result = await dashboardService.getDashboardById(fakeId);

            expect(result.success).toBe(false);
            if (isApiError(result)) {
                expect(result.message).toBe('Dashboard non trouvé.');
            }
        });
    });

    describe('createDashboard', () => {
        it('should create dashboard successfully', async () => {
            const testUser = await createTestUser({ email: 'creator@example.com', roleName: 'user' });

            const payload = {
                title: 'New Dashboard',
                visibility: 'private' as const,
                layout: [],
                ownerId: (testUser.user as any)._id.toString()
            };

            const result = await dashboardService.createDashboard((testUser.user as any)._id.toString(), payload);

            expect(result.success).toBe(true);
            if (isApiSuccess(result)) {
                expect(result.data.title).toBe('New Dashboard');
                expect(result.data.visibility).toBe('private');

                // Verify it was saved to database
                const saved = await Dashboard.findById((result.data as any)._id);
                expect(saved).toBeTruthy();
            }
        });
    });

    describe('deleteDashboard', () => {
        it('should delete dashboard successfully', async () => {
            const testUser = await createTestUser({ email: 'owner@example.com', roleName: 'user' });

            const dashboard = await Dashboard.create({
                dashboardId: 'dashboard-test-delete',
                title: 'To Delete',
                widgets: [],
                ownerId: (testUser.user as any)._id,
                visibility: 'private',
                layout: []
            });

            const result = await dashboardService.deleteDashboard((dashboard as any)._id.toString());

            expect(result.success).toBe(true);
            if (isApiSuccess(result)) {
                expect(result.data.message).toBe('Dashboard supprimé.');
            }

            // Verify it was deleted
            const deleted = await Dashboard.findById((dashboard as any)._id);
            expect(deleted).toBeNull();
        });

        it('should return error for non-existent dashboard', async () => {
            const fakeId = new mongoose.Types.ObjectId().toString();
            const result = await dashboardService.deleteDashboard(fakeId);

            expect(result.success).toBe(false);
            if (isApiError(result)) {
                expect(result.message).toBe('Dashboard non trouvé.');
            }
        });
    });

    describe('enableShare', () => {
        it('should enable share for dashboard', async () => {
            const testUser = await createTestUser({ email: 'owner@example.com', roleName: 'user' });

            const dashboard = await Dashboard.create({
                dashboardId: 'dashboard-test-share',
                title: 'Shareable Dashboard',
                widgets: [],
                ownerId: (testUser.user as any)._id,
                visibility: 'private',
                layout: []
            });

            const result = await dashboardService.enableShare((dashboard as any)._id.toString());

            expect(result.success).toBe(true);
            if (isApiSuccess(result)) {
                expect(result.data.shareId).toBeTruthy();
            }
        });
    });

    describe('getSharedDashboard', () => {
        it('should get shared dashboard by shareId', async () => {
            const testUser = await createTestUser({ email: 'owner@example.com', roleName: 'user' });

            const dashboard = await Dashboard.create({
                dashboardId: 'dashboard-test-get-shared',
                title: 'Public Dashboard',
                widgets: [],
                ownerId: (testUser.user as any)._id,
                visibility: 'private',
                layout: [],
                shareId: 'test-share-id-get',
                shareEnabled: true
            });

            const result = await dashboardService.getSharedDashboard('test-share-id-get');

            expect(result.success).toBe(true);
            if (isApiSuccess(result)) {
                expect(result.data.title).toBe('Public Dashboard');
            }
        });

        it('should return error for non-existent share', async () => {
            const result = await dashboardService.getSharedDashboard('non-existent-share');

            expect(result.success).toBe(false);
            if (isApiError(result)) {
                expect(result.message).toBe('Dashboard non trouvé ou non partagé.');
            }
        });
    });
});
