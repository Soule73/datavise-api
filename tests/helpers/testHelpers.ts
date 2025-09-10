import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../../src/models/User';
import Role from '../../src/models/Role';
import Permission from '../../src/models/Permission';

/**
 * Crée un utilisateur de test avec les données fournies
 */
export const createTestUser = async (userData: {
    username?: string;
    email?: string;
    password?: string;
    roleName?: string;
}) => {
    const {
        username = 'testuser',
        email = 'test@example.com',
        password = 'password123',
        roleName = 'user'
    } = userData;

    // Récupérer le rôle existant (ne pas créer un nouveau rôle vide)
    let role = await Role.findOne({ name: roleName });
    if (!role) {
        // Si le rôle n'existe pas, lever une erreur car les rôles doivent être initialisés avant
        throw new Error(`Role '${roleName}' not found. Make sure to call initPermissionsAndRoles() first.`);
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const user = await User.create({
        username,
        email,
        password: hashedPassword,
        roleId: role._id
    });

    return { user, role, plainPassword: password };
};

/**
 * Génère un token JWT pour un utilisateur de test
 */
export const generateTestToken = (userId: string, role?: string) => {
    const payload = { id: userId, role: role || 'user' };
    return jwt.sign(payload, process.env.JWT_SECRET!, {
        expiresIn: '1h'
    });
};/**
 * Crée des permissions de test
 */
export const createTestPermissions = async () => {
    const permissions = [
        { name: 'read_datasource', description: 'Read data sources' },
        { name: 'write_datasource', description: 'Write data sources' },
        { name: 'delete_datasource', description: 'Delete data sources' },
        { name: 'read_dashboard', description: 'Read dashboards' },
        { name: 'write_dashboard', description: 'Write dashboards' },
        { name: 'delete_dashboard', description: 'Delete dashboards' }
    ];

    return await Permission.insertMany(permissions);
};

/**
 * Crée un admin de test avec toutes les permissions
 */
export const createTestAdmin = async () => {
    const permissions = await createTestPermissions();

    const adminRole = await Role.create({
        name: 'admin',
        description: 'Administrator role',
        permissions: permissions.map(p => p._id)
    });

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        roleId: adminRole._id
    });

    return {
        user: admin,
        role: adminRole,
        permissions,
        plainPassword: 'admin123',
        token: generateTestToken(String(admin._id), 'admin')
    };
};

/**
 * Données de test pour les sources de données
 */
export const mockDataSourceData = {
    name: 'Test Data Source',
    description: 'A test data source',
    type: 'csv',
    endpoint: undefined,
    filePath: 'test-file.csv'
};

/**
 * Données de test pour les tableaux de bord
 */
export const mockDashboardData = {
    name: 'Test Dashboard',
    description: 'A test dashboard',
    widgets: []
};

/**
 * Données de test pour les widgets
 */
export const mockWidgetData = {
    name: 'Test Widget',
    type: 'chart',
    config: {
        chartType: 'bar',
        dataSource: null
    }
};
