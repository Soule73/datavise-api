import { z } from "zod";

export const registerSchema = z.object({
    username: z.string().min(2, "Le nom d'utilisateur doit contenir au moins 2 caractères."),
    email: z.email("Email invalide."),
    password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères."),
});

export const loginSchema = z.object({
    email: z.email("Email invalide."),
    password: z.string().min(1, "Mot de passe requis."),
});

export const createUserSchema = z.object({
    username: z.string().min(2, "Le nom d'utilisateur doit contenir au moins 2 caractères."),
    email: z.email("Email invalide."),
    password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères."),
    roleId: z.string().min(1, "Le rôle est requis."),
});

export const updateUserSchema = z.object({
    username: z.string().min(2, "Le nom d'utilisateur doit contenir au moins 2 caractères.").optional(),
    email: z.email("Email invalide.").optional(),
    password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères.").optional(),
    roleId: z.string().min(1, "Le rôle est requis.").optional(),
});
