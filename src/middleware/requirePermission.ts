import { Response, NextFunction } from "express";
import User from "../models/User";
import { AuthRequest, PopulatedRole } from "../types/authType";

/**
 * Middleware générique pour vérifier qu'un utilisateur a la permission demandée.
 * @param permissionName ex: 'dashboard:canUpdate'
 * @param allowSelfUpdateUser Si true, autorise un user à modifier ses propres infos (PUT /users/:id)
 */
export function requirePermission(
  permissionName: string,
  allowSelfUpdateUser = false
) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Non authentifié." });
    }

    if (
      allowSelfUpdateUser &&
      req.method === "PUT" &&
      req.params.id &&
      String(req.params.id) ===
      String((user as { _id?: string; id: string })._id ?? user.id)
    ) {
      return next();
    }

    const userPop = await User.findById(
      (user as { _id?: string; id: string })._id ?? user.id
    ).populate({ path: "roleId", populate: { path: "permissions" } });

    const roleRaw = userPop?.roleId;

    const isPopulatedRole = (r: unknown): r is PopulatedRole =>
      !!r && typeof r === "object" && "permissions" in r && "name" in r;

    const role = isPopulatedRole(roleRaw) ? roleRaw : null;

    if (!role) {
      return res.status(403).json({ message: "Aucun rôle associé." });
    }

    const perms = Array.isArray(role.permissions)
      ? role.permissions.map((p) => {
        if (typeof p === "string") {
          return p;
        }

        if (
          typeof p === "object" &&
          p &&
          "name" in p &&
          typeof (p as { name: unknown }).name === "string"
        ) {
          return (p as { name: string }).name;
        }

        if (
          typeof p === "object" &&
          p &&
          typeof (p as object).toString === "function"
        ) {
          return (p as object).toString();
        }

        return "";
      })
      : [];

    if (perms.includes(permissionName)) {
      return next();
    }

    return res.status(403).json({ message: "Permission insuffisante." });
  };
}
