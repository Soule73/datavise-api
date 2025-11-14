import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../../src/models/User';
import Role from '../../src/models/Role';

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
};
