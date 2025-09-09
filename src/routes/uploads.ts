import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import { requireAuth } from "../middleware/auth";
import { getUploadsDir } from "../utils/uploadsPaths";

const router = express.Router();

/**
 * Route pour récupérer un fichier uploadé.
 * L'utilisateur doit être authentifié.
 *
 * @param {string} filename - Le nom du fichier à récupérer.
 *
 * ROUTE GET /uploads/:filename
 *
 */
router.get(
  "/:filename",
  requireAuth,
  (req: Request, res: Response, next: NextFunction) => {
    const { filename } = req.params;
    // Utilise le même répertoire que le service d'upload
    const uploadsDir = getUploadsDir();
    const filePath = path.join(uploadsDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Fichier non trouvé." });
    }

    if (filePath.endsWith(".csv")) {
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      const content = fs.readFileSync(filePath);
      const bom = Buffer.from([0xef, 0xbb, 0xbf]);
      res.send(Buffer.concat([bom, content]));
      return;
    } else if (filePath.endsWith(".txt")) {
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
    }

    res.sendFile(filePath, {
      headers: { "Content-Disposition": `attachment; filename="${filename}"` },
    });
  }
);

export default router;
