import User from '../../src/models/User';
import Role from '../../src/models/Role';
import bcrypt from 'bcrypt';

describe('User Model', () => {
    let testRole: any;

    beforeEach(async () => {
        // Créer un rôle de test
        testRole = await Role.create({
            name: 'testRole',
            description: 'Test role for user tests',
            permissions: []
        });
    });

    describe('User Creation', () => {
        it('should create a user with valid data', async () => {
            const userData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
                roleId: testRole._id
            };

            const user = await User.create(userData);

            expect(user).toBeDefined();
            expect(user.username).toBe(userData.username);
            expect(user.email).toBe(userData.email);
            expect(user.roleId).toEqual(testRole._id);
        });

        it('should save password as provided (hashing is done by service)', async () => {
            const plainPassword = 'password123';
            const userData = {
                username: 'testuser2',
                email: 'test2@example.com',
                password: plainPassword,
                roleId: testRole._id
            };

            const user = await User.create(userData);

            // Le modèle Mongoose sauvegarde le mot de passe tel quel
            // Le hachage est fait par le service, pas par le modèle
            expect(user.password).toBe(plainPassword);
        });

        it('should not create user without required fields', async () => {
            const userData = {
                email: 'test@example.com',
                password: 'password123'
                // username manquant
            };

            await expect(User.create(userData)).rejects.toThrow();
        });

        it('should create user even with invalid email format (validation handled by service)', async () => {
            const userData = {
                username: 'testuser',
                email: 'invalid-email',
                password: 'password123',
                roleId: testRole._id
            };

            // Le modèle Mongoose n'a pas de validation email built-in
            // La validation est gérée par le service avec Zod
            const user = await User.create(userData);
            expect(user.email).toBe('invalid-email');
        });

        it('should not create user with duplicate email', async () => {
            const userData1 = {
                username: 'testuser1',
                email: 'duplicate@example.com',
                password: 'password123',
                roleId: testRole._id
            };

            const userData2 = {
                username: 'testuser2',
                email: 'duplicate@example.com', // même email
                password: 'password123',
                roleId: testRole._id
            };

            await User.create(userData1);
            await expect(User.create(userData2)).rejects.toThrow();
        });

        it('should allow duplicate username (uniqueness only on email)', async () => {
            const userData1 = {
                username: 'duplicateuser',
                email: 'test1@example.com',
                password: 'password123',
                roleId: testRole._id
            };

            const userData2 = {
                username: 'duplicateuser', // même username
                email: 'test2@example.com', // email différent
                password: 'password123',
                roleId: testRole._id
            };

            await User.create(userData1);
            const user2 = await User.create(userData2);
            expect(user2.username).toBe('duplicateuser');
        });
    });

    describe('User Methods', () => {
        let testUser: any;

        beforeEach(async () => {
            testUser = await User.create({
                username: 'methodtestuser',
                email: 'methodtest@example.com',
                password: 'password123',
                roleId: testRole._id
            });
        });

        it('should populate roleId when requested', async () => {
            const userWithRole = await User.findById(testUser._id).populate('roleId');

            expect(userWithRole).toBeDefined();
            expect(userWithRole!.roleId).toBeDefined();
            expect((userWithRole!.roleId as any).name).toBe('testRole');
        });

        it('should include all fields in JSON output (password filtering done at service level)', () => {
            const userJSON = testUser.toJSON();

            // Le modèle de base inclut tous les champs
            // Le filtrage du mot de passe est fait au niveau du service
            expect(userJSON.password).toBeDefined();
            expect(userJSON.username).toBe('methodtestuser');
            expect(userJSON.email).toBe('methodtest@example.com');
        });
    });
});
