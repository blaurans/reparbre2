import { randomBytes, createHash } from 'node:crypto';

/** État OAuth signé pour éviter le CSRF */
export function createState(): string {
	return randomBytes(16).toString('hex');
}

/** Vérificateur + défi PKCE */
export function createPkce(): { verifier: string; challenge: string } {
	const verifier = randomBytes(32).toString('base64url');
	const challenge = createHash('sha256').update(verifier).digest('base64url');
	return { verifier, challenge };
}
