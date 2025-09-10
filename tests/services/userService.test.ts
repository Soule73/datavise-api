import userService from '../../src/services/userService';
import { isApiSuccess, isApiError } from '../helpers/apiHelpers';
import Role from '../../src/models/Role';

describe('User Service', () => {
    describe('register', () => {
        let userRole: any;

        beforeEach(async () => {
            // Créer un rôle "user" par défaut requis pour l'enregistrement
            userRole = await Role.create({
                name: 'user',
                description: 'Default user role',
                permissions: []
            });
        });

        it('should register a new user successfully', async () => {
            const userData = {
                username: 'newuser',
                email: 'newuser@example.com',
                password: 'password123'
            };

            const result = await userService.register(userData);

            expect(isApiSuccess(result)).toBe(true);

            if (isApiSuccess(result)) {
                expect(result.data.user.username).toBe(userData.username);
                expect(result.data.user.email).toBe(userData.email);
                expect(result.data.token).toBeDefined();
                expect(result.data.user.role).toBeDefined();
            }
        });

        it('should not register user with existing email', async () => {
            const userData = {
                username: 'user1',
                email: 'existing@example.com',
                password: 'password123'
            };

            // Premier utilisateur
            await userService.register(userData);

            // Tentative avec le même email
            const userData2 = {
                username: 'user2',
                email: 'existing@example.com',
                password: 'password123'
            };

            const result = await userService.register(userData2);

            expect(isApiError(result)).toBe(true);

            if (isApiError(result)) {
                expect(result.message).toContain('email');
            }
        });

        it('should validate required fields', async () => {
            const invalidData = {
                // username manquant
                email: 'test@example.com',
                password: 'password123'
            };

            const result = await userService.register(invalidData as any);

            expect(isApiError(result)).toBe(true);
        });
    });

    describe('login', () => {
        let userRole: any;

        beforeEach(async () => {
            userRole = await Role.create({
                name: 'user',
                description: 'User role',
                permissions: []
            });

            await userService.register({
                username: 'loginuser',
                email: 'login@example.com',
                password: 'password123'
            });
        });

        it('should login with valid credentials', async () => {
            const loginData = {
                email: 'login@example.com',
                password: 'password123'
            };

            const result = await userService.login(loginData);

            expect(isApiSuccess(result)).toBe(true);

            if (isApiSuccess(result)) {
                expect(result.data.user.email).toBe(loginData.email);
                expect(result.data.token).toBeDefined();
            }
        });

        it('should not login with invalid email', async () => {
            const loginData = {
                email: 'nonexistent@example.com',
                password: 'password123'
            };

            const result = await userService.login(loginData);

            expect(isApiError(result)).toBe(true);

            if (isApiError(result)) {
                expect(result.message).toContain('Identifiants invalides');
            }
        });

        it('should not login with invalid password', async () => {
            const loginData = {
                email: 'login@example.com',
                password: 'wrongpassword'
            };

            const result = await userService.login(loginData);

            expect(isApiError(result)).toBe(true);

            if (isApiError(result)) {
                expect(result.message).toContain('Identifiants invalides');
            }
        });
    });

    describe('createUser', () => {
        let testRole: any;

        beforeEach(async () => {
            testRole = await Role.create({
                name: 'testrole',
                description: 'Test role for service tests',
                permissions: []
            });
        });

        it('should create a new user successfully', async () => {
            const userData = {
                username: 'newserviceuser',
                email: 'newservice@example.com',
                password: 'password123',
                roleId: testRole._id.toString()
            };

            const result = await userService.createUser(userData);

            expect(isApiSuccess(result)).toBe(true);

            if (isApiSuccess(result)) {
                expect(result.data.user.username).toBe(userData.username);
                expect(result.data.user.email).toBe(userData.email);
            }
        });

        it('should not create user with existing email', async () => {
            const userData1 = {
                username: 'user1',
                email: 'duplicate@example.com',
                password: 'password123',
                roleId: testRole._id.toString()
            };

            const userData2 = {
                username: 'user2',
                email: 'duplicate@example.com',
                password: 'password123',
                roleId: testRole._id.toString()
            };

            await userService.createUser(userData1);

            const result = await userService.createUser(userData2);

            expect(isApiError(result)).toBe(true);

            if (isApiError(result)) {
                expect(result.message).toContain('email');
            }
        });
    });

    describe('listUsers', () => {
        let testRole: any;

        beforeEach(async () => {
            testRole = await Role.create({
                name: 'testrole',
                description: 'Test role',
                permissions: []
            });

            // Créer plusieurs utilisateurs de test
            await userService.createUser({
                username: 'user1',
                email: 'user1@example.com',
                password: 'password123',
                roleId: testRole._id.toString()
            });

            await userService.createUser({
                username: 'user2',
                email: 'user2@example.com',
                password: 'password123',
                roleId: testRole._id.toString()
            });
        });

        it('should list all users', async () => {
            const result = await userService.listUsers();

            expect(isApiSuccess(result)).toBe(true);

            if (isApiSuccess(result)) {
                expect(Array.isArray(result.data)).toBe(true);
                expect(result.data.length).toBeGreaterThan(0);
            }
        });
    });

    describe('listRolesWithCanDelete', () => {
        it('should list roles with canDelete flag', async () => {
            await Role.create({
                name: 'testrole1',
                description: 'Test role 1',
                permissions: []
            });

            await Role.create({
                name: 'testrole2',
                description: 'Test role 2',
                permissions: []
            });

            const result = await userService.listRolesWithCanDelete();

            expect(isApiSuccess(result)).toBe(true);

            if (isApiSuccess(result)) {
                expect(Array.isArray(result.data)).toBe(true);
                expect(result.data.length).toBeGreaterThan(0);
                expect(result.data[0]).toHaveProperty('canDelete');
            }
        });
    });

    describe('listPermissions', () => {
        it('should list all permissions', async () => {
            const result = await userService.listPermissions();

            expect(isApiSuccess(result)).toBe(true);

            if (isApiSuccess(result)) {
                expect(Array.isArray(result.data)).toBe(true);
            }
        });
    });
});
