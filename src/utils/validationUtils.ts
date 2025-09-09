import { $ZodIssue } from "zod/v4/core/errors.cjs";
// Fonction utilitaire pour construire un objet d'erreurs clé/valeur à partir des issues Zod
export function buildErrorObject(issues: $ZodIssue[]): Record<string, string> {
    const errorObj: Record<string, string> = {};
    for (const issue of issues) {
        errorObj[issue.path.join(".")] = issue.message;
    }
    return errorObj;
}
