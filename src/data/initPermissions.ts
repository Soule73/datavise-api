import User from "../models/User";
import Permission from "../models/Permission";
import Role from "../models/Role";
import bcrypt from "bcryptjs";

const permissions = [
  // User
  { name: "user:canView", description: "Voir les utilisateurs" },
  { name: "user:canCreate", description: "Créer un utilisateur" },
  { name: "user:canUpdate", description: "Modifier un utilisateur" },
  { name: "user:canDelete", description: "Supprimer un utilisateur" },

  // Dashboard
  { name: "dashboard:canView", description: "Voir les dashboards" },
  { name: "dashboard:canCreate", description: "Créer un dashboard" },
  { name: "dashboard:canUpdate", description: "Modifier un dashboard" },
  { name: "dashboard:canDelete", description: "Supprimer un dashboard" },

  // Widget
  { name: "widget:canView", description: "Voir les widgets" },
  { name: "widget:canCreate", description: "Créer un widget" },
  { name: "widget:canUpdate", description: "Modifier un widget" },
  { name: "widget:canDelete", description: "Supprimer un widget" },

  // DataSource
  { name: "datasource:canView", description: "Voir les sources de données" },
  { name: "datasource:canCreate", description: "Créer une source de données" },
  {
    name: "datasource:canUpdate",
    description: "Modifier une source de données",
  },
  {
    name: "datasource:canDelete",
    description: "Supprimer une source de données",
  },

  // Role
  { name: "role:canView", description: "Voir les rôles" },
  { name: "role:canCreate", description: "Créer un rôle" },
  { name: "role:canUpdate", description: "Modifier un rôle" },
  { name: "role:canDelete", description: "Supprimer un rôle" },
];

export async function initPermissions() {
  for (const perm of permissions) {
    await Permission.updateOne(
      { name: perm.name },
      { $set: perm },
      { upsert: true }
    );
  }
}

export async function initPermissionsAndRoles() {
  await initPermissions();

  const allPerms = await Permission.find({});
  const adminPerms = allPerms.map((p) => p._id);
  const userPerms = allPerms
    .filter((p) => !p.name.startsWith("user:") && !p.name.startsWith("role:"))
    .map((p) => p._id);

  await Role.updateOne(
    { name: "admin" },
    {
      $set: {
        name: "admin",
        description: "Administrateur (tous droits)",
        permissions: adminPerms,
      },
    },
    { upsert: true }
  );

  await Role.updateOne(
    { name: "user" },
    {
      $set: {
        name: "user",
        description: "Utilisateur standard",
        permissions: userPerms,
      },
    },
    { upsert: true }
  );

  // Création d'un utilisateur admin par défaut en développement
  if (process.env.ENV_MODE === "development") {
    const adminUser = await User.findOne({ $or: [{ username: "admin" }, { email: "admin@example.com" }] });
    if (!adminUser) {
      const adminRole = await Role.findOne({ name: "admin" });
      const passwordHash = await bcrypt.hash("password", 10);
      await User.create({
        username: "admin",
        password: passwordHash,
        roleId: adminRole ? adminRole._id : undefined,
        email: "admin@example.com"
      });
    }
  }
}
