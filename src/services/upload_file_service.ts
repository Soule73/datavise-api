import multer from "multer";
import path from "path";
import fs from "fs";
import { getUploadsDir } from "../utils/uploadsPaths";

/**
 * Crée le répertoire de stockage s'il n'existe pas.
 * Cette fonction est appelée de manière sécurisée pour éviter les erreurs sur Vercel.
 */
const ensureUploadsDir = () => {
    try {
        const uploadsDir = getUploadsDir();
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
    } catch (error) {
        console.warn('Impossible de créer le dossier uploads:', error);
        // En cas d'erreur, on continue sans créer le dossier
        // Multer gérera l'erreur lors de l'upload
    }
};

/**
 * Service de gestion des fichiers uploadés.
 * Utilise multer pour gérer les fichiers uploadés via l'API.
 * Limite la taille des fichiers à 10 Mo et n'autorise que les fichiers CSV et JSON.
 *
 * Note: En production sur Vercel, les fichiers sont stockés dans /tmp et sont éphémères.
 * Pour un stockage persistant, considérez l'utilisation d'un service cloud.
 */
const uploadFileService
    = multer({
        storage: multer.diskStorage({
            destination: function (req, file, cb) {
                // S'assurer que le dossier existe avant d'y écrire
                ensureUploadsDir();
                cb(null, getUploadsDir());
            },
            filename: function (req, file, cb) {
                const ext = path.extname(file.originalname) || ".csv";
                const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
                cb(null, uniqueName);
            },
        }),
        limits: { fileSize: 10 * 1024 * 1024 },
        fileFilter: function (req, file, cb) {
            const allowedTypes = [".csv", ".json"];
            const ext = path.extname(file.originalname);
            if (!allowedTypes.includes(ext)) {
                return new Error("Type de fichier non autorisé");
            }
            cb(null, true);
        },
    }).single("file");



export default uploadFileService;


