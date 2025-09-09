/**
 * Génère un ID pseudo-aléatoire avec pondération de 75% chiffres et 25% lettres.
 *
 * @param withHyphens    - inclure les tirets (true|false)
 * @param length         - longueur de l’ID (hors préfixe/suffixe), 1 à 36
 * @param includeLetters - inclure les lettres a-z (défaut true)
 * @param prefix         - chaîne à préfixer
 * @param suffix         - chaîne à suffixer
 * @returns ID alphanumérique généré
 */
export function generateUUID(
    withHyphens: boolean = false,
    length: number = 32,
    includeLetters: boolean = true,
    prefix: string = '',
    suffix: string = ''
): string {
    if (length < 1 || length > 36) {
        throw new RangeError('length must be between 1 and 36');
    }

    const digits = '0123456789';
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    const digitThreshold = Math.floor(256 * 0.75); // 75% de 0–255

    // Génère deux suites d’octets aléatoires :
    // - l’une pour décider chiffre vs lettre
    // - l’autre pour choisir l’indice dans le charset
    const randType = new Uint8Array(length);
    const randIndex = new Uint8Array(length);
    crypto.getRandomValues(randType);
    crypto.getRandomValues(randIndex);

    let uuid = '';
    for (let i = 0; i < length; i++) {
        if (includeLetters) {
            if (randType[i] < digitThreshold) {
                uuid += digits[randIndex[i] % digits.length];
            } else {
                uuid += letters[randIndex[i] % letters.length];
            }
        } else {
            uuid += digits[randIndex[i] % digits.length];
        }
    }

    if (withHyphens) {
        const parts = [
            uuid.slice(0, 8),
            uuid.slice(8, 12),
            uuid.slice(12, 16),
            uuid.slice(16, 20),
            uuid.slice(20)
        ].filter(Boolean);
        uuid = parts.join('-');
    }

    return `${prefix}${uuid}${suffix}`;
}
