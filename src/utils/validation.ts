import { Types } from "mongoose";

/**
 * Valide si une chaîne est un ObjectId MongoDB valide (24 caractères hexadécimaux)
 */
export function isValidObjectId(id: string | null | undefined): boolean {
    if (!id) return false;
    return Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id);
}
