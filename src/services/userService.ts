import {
  createRoleSchema,
  updateRoleSchema
} from "../validation/role";
import {
  registerSchema,
  loginSchema,
  createUserSchema,
  updateUserSchema
} from "../validation/user";
import User from "../models/User";
import Role from "../models/Role";
import Permission from "../models/Permission";
import Widget from "../models/Widget";
import Dashboard from "../models/Dashboard";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type {
  IUser,
  IRole,
  IPermission,
  PopulatedRole,
  PopulatedPermission,
  RegisterPayload,
  LoginPayload,
  CreateUserPayload,
  UpdateUserPayload,
  CreateRolePayload,
  UpdateRolePayload,
  UserResponse,
  UserRoleResponse,
  LeanRoleWithCanDelete
} from "../types/authType";
import { buildErrorObject } from "../utils/validationUtils";
import mongoose, { ObjectId } from "mongoose";
import { ApiResponse } from "../types/api";
import { toApiData, toApiError } from "../utils/api";

/**
 * Retourne une version "sanitisée" d'un utilisateur, sans mot de passe.
 * @param user L'utilisateur à sanitiser, peut être un objet IUser, null ou undefined.
 * @returns Un objet utilisateur sans le mot de passe, ou l'utilisateur original si null/undefined.
 *
 */
function sanitizeUser(user: IUser | null | undefined) {
  if (!user) return user;
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  return obj;
}

/**
 * Génère un token JWT pour l'utilisateur.
 * @param payload Les données à inclure dans le token.
 * @returns Le token JWT signé.
 */
function generateToken(payload: object): string {
  const jwtSecret = process.env.JWT_SECRET || "secret";
  let expiresIn = process.env.JWT_EXPIRATION as any;

  return jwt.sign(
    payload,
    jwtSecret,
    expiresIn !== undefined ? { expiresIn: expiresIn } : {}
  );
}

/** * Service utilisateur pour gérer l'authentification, les rôles et les permissions.
 * Fournit des méthodes pour l'enregistrement, la connexion,
 * la création, la mise à jour et la suppression d'utilisateurs,
 * ainsi que la gestion des rôles et des permissions.
 * @module userService
 *
 * */
const userService = {
  /**
   * Enregistre un nouvel utilisateur.
   * @param {RegisterPayload} payload - Les données d'enregistrement de l'utilisateur.
   * @returns {Promise<ApiResponse<{ user: UserResponse; token: string }>>} - La réponse contenant l'utilisateur et le token JWT.
   */
  async register(
    payload: RegisterPayload
  ): Promise<ApiResponse<{ user: UserResponse; token: string }>> {
    // Validation via schéma importé
    const parseResult = registerSchema.safeParse(payload);
    if (!parseResult.success) {
      const errorObj = buildErrorObject(parseResult.error.issues);
      return toApiError("Erreur de validation", 422, errorObj);
    }
    const { username, email, password } = parseResult.data;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return toApiError("Cet email est déjà utilisé.", 422);
    }
    const defaultRole = await Role.findOne({ name: "user" });
    if (!defaultRole) {
      return toApiError("Rôle par défaut 'user' introuvable.", 500);
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const createdUser = await User.create({
      username,
      email,
      password: passwordHash,
      roleId: defaultRole._id,
      passwordChangedAt: new Date(),
    });
    const userPopulated = await User.findById(createdUser._id).populate({
      path: "roleId",
      populate: { path: "permissions" },
    });
    const userId = (createdUser._id as ObjectId | string).toString();
    let role: UserRoleResponse | null = null;
    if (
      userPopulated &&
      userPopulated.roleId &&
      typeof userPopulated.roleId === "object" &&
      "permissions" in userPopulated.roleId
    ) {
      const r = userPopulated.roleId as unknown as PopulatedRole;
      role = {
        id: r._id.toString(),
        name: r.name,
        description: r.description,
        permissions: Array.isArray(r.permissions)
          ? r.permissions.map((p: PopulatedPermission) => ({
            id: p._id.toString(),
            name: p.name,
            description: p.description,
          }))
          : [],
      };
    }
    const userSigned = {
      id: userId,
      role: role?.name,
      passwordChangedAt: createdUser.passwordChangedAt
        ? createdUser.passwordChangedAt.getTime()
        : 0,
    };
    const token = generateToken(userSigned);
    return {
      data: {
        user: {
          id: userId,
          username: createdUser.username,
          email: createdUser.email,
          role,
        },
        token,
      },
    };
  },

  /**
   * Connecte un utilisateur existant.
   * @param {LoginPayload} payload - Les données de connexion de l'utilisateur.
   * @returns {Promise<ApiResponse<{ user: UserResponse; token: string }>>} - La réponse contenant l'utilisateur et le token JWT.
   */
  async login(
    payload: LoginPayload
  ): Promise<ApiResponse<{ user: UserResponse; token: string }>> {
    // Validation via schéma importé
    const parseResult = loginSchema.safeParse(payload);
    if (!parseResult.success) {
      const errorObj = buildErrorObject(parseResult.error.issues);
      return toApiError("Erreur de validation", 422, errorObj);
    }
    const { email, password } = parseResult.data;
    const userPopulated = await User.findOne({ email }).populate({
      path: "roleId",
      populate: { path: "permissions" },
    });
    const userPopId = userPopulated
      ? (userPopulated._id as ObjectId | string).toString()
      : "";
    if (!userPopulated) {
      return toApiError("Identifiants invalides.", 401);
    }
    if (!userPopulated.roleId) {
      return toApiError("Aucun rôle associé à ce compte.", 403);
    }
    const valid = await bcrypt.compare(password, userPopulated.password);
    if (!valid) {
      return toApiError("Identifiants invalides.", 401);
    }
    let role: UserRoleResponse | null = null;
    if (
      typeof userPopulated.roleId === "object" &&
      "permissions" in userPopulated.roleId
    ) {
      const r = userPopulated.roleId as unknown as PopulatedRole;
      role = {
        id: r._id.toString(),
        name: r.name,
        description: r.description,
        permissions: Array.isArray(r.permissions)
          ? r.permissions.map((p: PopulatedPermission) => ({
            id: p._id.toString(),
            name: p.name,
            description: p.description,
          }))
          : [],
      };
    }
    const token = generateToken({
      id: userPopId,
      role: role?.name,
      passwordChangedAt: userPopulated.passwordChangedAt
        ? userPopulated.passwordChangedAt.getTime()
        : 0,
    });
    return {
      data: {
        user: {
          id: userPopId,
          username: userPopulated.username,
          email: userPopulated.email,
          role,
        },
        token,
      },
    };
  },

  /**
   * Crée un nouvel utilisateur.
   * @param {CreateUserPayload} payload - Les données de création de l'utilisateur.
   * @returns {Promise<ApiResponse<{ user: IUser }>>} - La réponse contenant l'utilisateur créé.
   */
  async createUser(
    payload: CreateUserPayload
  ): Promise<ApiResponse<{ user: IUser }>> {
    // Validation via schéma importé
    const parseResult = createUserSchema.safeParse(payload);
    if (!parseResult.success) {
      const errorObj = buildErrorObject(parseResult.error.issues);
      return toApiError("Erreur de validation", 400, errorObj);
    }
    const { username, email, password, roleId } = parseResult.data;
    const existing = await User.findOne({ email });
    if (existing) {
      return toApiError("Cet email est déjà utilisé.", 422);
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hash, roleId });
    const userPopulated = await User.findById(user._id).populate(
      "roleId",
      "name"
    );
    return toApiData({ user: sanitizeUser(userPopulated) });
  },

  /**
   * Met à jour un utilisateur existant.
   * @param {string} id - L'ID de l'utilisateur à mettre à jour.
   * @param {UpdateUserPayload} payload - Les données de mise à jour de l'utilisateur.
   * @returns {Promise<ApiResponse<{ user: IUser }>>} - La réponse contenant l'utilisateur mis à jour.
   */
  async updateUser(
    id: string,
    payload: UpdateUserPayload
  ): Promise<ApiResponse<{ user: IUser }>> {
    // Validation via schéma importé
    const parseResult = updateUserSchema.safeParse(payload);
    if (!parseResult.success) {
      const errorObj = buildErrorObject(parseResult.error.issues);
      return toApiError("Erreur de validation", 400, errorObj);
    }
    const update: Partial<IUser> = {};
    if (parseResult.data.username) update.username = parseResult.data.username;
    if (parseResult.data.email) update.email = parseResult.data.email;
    if (parseResult.data.roleId)
      update.roleId = new mongoose.Types.ObjectId(parseResult.data.roleId);
    if (parseResult.data.password && parseResult.data.password.length > 0) {
      update.password = await bcrypt.hash(parseResult.data.password, 10);
      update.passwordChangedAt = new Date();
    }
    const user = await User.findByIdAndUpdate(id, update, {
      new: true,
    }).populate("roleId", "name");
    if (!user) {
      return toApiError("Utilisateur non trouvé.", 404);
    }
    return { data: { user: sanitizeUser(user) } };
  },

  /**
   * Supprime un utilisateur et ses widgets et dashboards associés.
   * @param {string} id - L'ID de l'utilisateur à supprimer.
   * @returns {Promise<ApiResponse<{ message: string }>>} - La réponse contenant un message de confirmation.
   */
  async deleteUser(id: string): Promise<ApiResponse<{ message: string }>> {
    await Widget.deleteMany({ ownerId: id, visibility: "private" });

    await Widget.updateMany(
      { ownerId: id, visibility: "public" },
      { $set: { ownerId: null } }
    );

    await Dashboard.deleteMany({ ownerId: id, visibility: "private" });

    await Dashboard.updateMany(
      { ownerId: id, visibility: "public" },
      { $set: { ownerId: null } }
    );

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return toApiError("Utilisateur non trouvé.", 404);
    }

    return toApiData({ message: "Utilisateur supprimé." });
  },

  /**
   * Liste tous les rôles avec une indication de s'ils peuvent être supprimés.
   * @returns {Promise<LeanRoleWithCanDelete[]>} - La liste des rôles avec la propriété canDelete.
   */
  async listRolesWithCanDelete(): Promise<
    ApiResponse<LeanRoleWithCanDelete[]>
  > {
    const roles = await Role.find().populate("permissions").lean();

    const users = await User.find({}, "roleId").lean();

    const roleUsage: Record<string, number> = {};

    users.forEach((u) => {
      if (u.roleId) {
        roleUsage[u.roleId.toString()] =
          (roleUsage[u.roleId.toString()] || 0) + 1;
      }
    });

    const rolesMap = roles.map((r) => ({
      ...r,
      _id: r._id.toString(),
      canDelete: !roleUsage[r._id?.toString()],
    }));

    return toApiData(rolesMap);
  },

  /**
   * Crée un nouveau rôle.
   * @param {CreateRolePayload} payload - Les données de création du rôle.
   * @returns {Promise<ApiResponse<IRole>>} - La réponse contenant le rôle créé.
   */
  async createRole(payload: CreateRolePayload): Promise<ApiResponse<IRole>> {
    const parseResult = createRoleSchema.safeParse(payload);
    if (!parseResult.success) {
      const errorObj = buildErrorObject(parseResult.error.issues);
      return toApiError("Erreur de validation", 400, errorObj);
    }
    const { name, description, permissions } = parseResult.data;
    const perms = await Permission.find({ _id: { $in: permissions } });
    if (perms.length !== permissions.length) {
      return toApiError("Une ou plusieurs permissions sont invalides.", 400);
    }
    const role = await Role.create({ name, description, permissions });
    return toApiData(role);
  },

  /**
   * Met à jour un rôle existant.
   * @param {string} id - L'ID du rôle à mettre à jour.
   * @param {UpdateRolePayload} payload - Les données de mise à jour du rôle.
   * @returns {Promise<ApiResponse<IRole>>} - La réponse contenant le rôle mis à jour.
   */
  async updateRole(
    id: string,
    payload: UpdateRolePayload
  ): Promise<ApiResponse<IRole>> {
    const parseResult = updateRoleSchema.safeParse(payload);
    if (!parseResult.success) {
      const errorObj = buildErrorObject(parseResult.error.issues);
      return toApiError("Erreur de validation", 400, errorObj);
    }
    const { name, description, permissions } = parseResult.data;
    if (permissions) {
      const perms = await Permission.find({ _id: { $in: permissions } });
      if (perms.length !== permissions.length)
        return toApiError("Une ou plusieurs permissions sont invalides.", 400);
    }
    const role = await Role.findByIdAndUpdate(
      id,
      { $set: { name, description, ...(permissions ? { permissions } : {}) } },
      { new: true }
    ).populate("permissions");
    if (!role) {
      return toApiError("Rôle non trouvé.", 404);
    }
    return toApiData(role);
  },

  /**
   * Supprime un rôle existant.
   * @param {string} id - L'ID du rôle à supprimer.
   * @returns {Promise<ApiResponse<{ message: string }>>} - La réponse contenant un message de confirmation.
   */
  async deleteRole(id: string): Promise<ApiResponse<{ message: string }>> {
    const usersWithRole = await User.countDocuments({ roleId: id });

    if (usersWithRole > 0) {
      return toApiError(
        "Impossible de supprimer un rôle utilisé par des utilisateurs.",
        400
      );
    }

    const role = await Role.findByIdAndDelete(id);
    if (!role) {
      return toApiError("Rôle non trouvé.", 404);
    }

    return toApiData({ message: "Rôle supprimé." });
  },

  /**
   * Liste toutes les permissions disponibles.
   * @returns {Promise<IPermission[]>} - La liste des permissions.
   */
  async listPermissions(): Promise<ApiResponse<IPermission[]>> {
    const permissions = await Permission.find();

    return toApiData(permissions);
  },

  /**
   * Liste tous les utilisateurs.
   * @returns {Promise<IUser[]>} - La liste des utilisateurs sans mot de passe.
   */
  async listUsers(): Promise<ApiResponse<IUser[]>> {
    const users = await User.find().populate("roleId", "name");

    return toApiData(users.map(sanitizeUser));
  },
};

export default userService;
