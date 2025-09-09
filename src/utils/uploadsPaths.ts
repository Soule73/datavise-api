import path from "path";

/**
 * Retourne le chemin du répertoire uploads selon l'environnement.
 * En production (Vercel), utilise /tmp/uploads qui est le seul dossier accessible en écriture.
 * En développement, utilise le dossier uploads local.
 * 
 * @returns {string} Le chemin vers le répertoire uploads
 */
export const getUploadsDir = (): string => {
    return process.env.NODE_ENV === 'production'
        ? '/tmp/uploads'
        : path.resolve(process.cwd(), "uploads");
};

/**
 * Retourne le chemin complet vers un fichier dans le répertoire uploads.
 * 
 * @param {string} filename - Le nom du fichier
 * @returns {string} Le chemin complet vers le fichier
 */
export const getUploadFilePath = (filename: string): string => {
    return path.join(getUploadsDir(), filename);
};
