import { env } from '$env/dynamic/private';

/**
 * Vérifie si un email a le droit d'administrer l'application.
 * La liste des admins est définie dans la variable d'environnement
 * ADMIN_EMAILS (adresses séparées par des virgules).
 */
export function estAdmin(email: string | undefined | null): boolean {
	if (!email) return false;
	const admins = (env.ADMIN_EMAILS || '')
		.split(',')
		.map((e) => e.trim().toLowerCase())
		.filter(Boolean);
	return admins.includes(email.toLowerCase());
}
