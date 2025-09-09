import { z } from "zod";

export const createRoleSchema = z.object({
    name: z.string().min(2, "Le nom du rôle doit contenir au moins 2 caractères."),
    description: z.string().optional(),
    permissions: z.array(z.string().min(1, "ID de permission requis.")).min(1, "Au moins une permission est requise."),
});

export const updateRoleSchema = z.object({
    name: z.string().min(2, "Le nom du rôle doit contenir au moins 2 caractères.").optional(),
    description: z.string().optional(),
    permissions: z.array(z.string().min(1, "ID de permission requis.")).min(1, "Au moins une permission est requise.").optional(),
});
