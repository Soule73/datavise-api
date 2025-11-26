import { z } from "zod";
import { idParamSchema } from "./common.schema";

export const registerSchema = z.object({
    username: z.string().min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères").max(50),
    email: z.string().email("Email invalide"),
    password: z.string()
        .min(8, "Le mot de passe doit contenir au moins 8 caractères")
        .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
        .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
        .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
});

export const loginSchema = z.object({
    email: z.string().email("Email invalide"),
    password: z.string().min(1, "Le mot de passe est requis"),
});

export const createUserSchema = z.object({
    username: z.string().min(3).max(50),
    email: z.string().email("Email invalide"),
    password: z.string().min(8)
        .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
        .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
        .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
    roleId: z.string().regex(/^[0-9a-fA-F]{24}$/, "ID de rôle invalide"),
});

export const updateUserSchema = z.object({
    username: z.string().min(3).max(50).optional(),
    email: z.string().email("Email invalide").optional(),
    password: z.string().min(8)
        .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
        .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
        .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
        .optional(),
    roleId: z.string().regex(/^[0-9a-fA-F]{24}$/, "ID de rôle invalide").optional(),
});

export const createRoleSchema = z.object({
    name: z.string().min(3, "Le nom du rôle doit contenir au moins 3 caractères").max(50),
    description: z.string().max(200).optional(),
    permissions: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).min(1, "Au moins une permission requise"),
});

export const updateRoleSchema = z.object({
    name: z.string().min(3).max(50).optional(),
    description: z.string().max(200).optional(),
    permissions: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
});

export const listUsersQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    roleId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
});

export const listRolesQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

export { idParamSchema };
