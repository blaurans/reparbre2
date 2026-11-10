import { db } from './db/index';
import { users, sessions } from './db/schema';
import { eq } from 'drizzle-orm';
import { randomBytes } from 'node:crypto';

const SESSION_DAYS = 30;
export const SESSION_COOKIE = 'reparbre_session';

export type SessionUser = {
	id: string;
	name: string;
	email: string;
	avatarUrl: string | null;
};

/** Crée une session et renvoie le token à poser en cookie */
export async function createSession(userId: string): Promise<{ token: string; expiresAt: Date }> {
	const token = randomBytes(32).toString('base64url');
	const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
	await db.insert(sessions).values({ id: token, userId, expiresAt });
	return { token, expiresAt };
}

/** Récupère l'utilisateur depuis le token de session, ou null */
export async function getUserFromToken(token: string | undefined): Promise<SessionUser | null> {
	if (!token) return null;
	const rows = await db
		.select({
			id: users.id,
			name: users.name,
			email: users.email,
			avatarUrl: users.avatarUrl,
			expiresAt: sessions.expiresAt
		})
		.from(sessions)
		.innerJoin(users, eq(sessions.userId, users.id))
		.where(eq(sessions.id, token))
		.limit(1);

	const row = rows[0];
	if (!row) return null;
	if (row.expiresAt < new Date()) {
		await db.delete(sessions).where(eq(sessions.id, token));
		return null;
	}
	return { id: row.id, name: row.name, email: row.email, avatarUrl: row.avatarUrl };
}

/** Supprime une session */
export async function destroySession(token: string): Promise<void> {
	await db.delete(sessions).where(eq(sessions.id, token));
}
