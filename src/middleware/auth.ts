import { AuthRequest } from "../types/authType";
import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

/**
 * Middleware pour vérifier l'authentification de l'utilisateur.
 * Vérifie la présence d'un token JWT dans l'en-tête Authorization.
 * Si le token est valide, l'utilisateur est ajouté à la requête.
 * Si le token est manquant ou invalide, une réponse 401 est renvoyée
 * avec un message d'erreur.
 * @param {AuthRequest} req - La requête HTTP contenant l'en-tête Authorization.
 * @param {Response} res - La réponse HTTP.
 * @param {NextFunction} next - La fonction de rappel pour passer au middleware suivant.
 * @returns {Promise<void>} - Une promesse qui résout lorsque la vérification est
*/
export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Non autorisé, token manquant." });

    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as {
      id: string;
      role: string;
      passwordChangedAt?: number;
    };

    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401).json({ message: "Utilisateur introuvable." });
      return;
    }

    if (
      user.passwordChangedAt &&
      decoded.passwordChangedAt !== undefined &&
      decoded.passwordChangedAt < user.passwordChangedAt.getTime()
    ) {
      res
        .status(401)
        .json({ message: "Session expirée, veuillez vous reconnecter." });
      return;
    }

    req.user = decoded;

    next();
  } catch (err) {
    res.status(401).json({ message: "Token invalide." });
  }
}

export function requireRole(role: "admin" | "user") {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || req.user.role !== role) {
      res.status(403).json({ message: "Accès refusé." });

      return;
    }

    next();
  };
}


export type { AuthRequest } from "../types/authType";