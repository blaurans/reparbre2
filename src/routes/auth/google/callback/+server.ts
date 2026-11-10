import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';
import { getGoogleClient } from '$lib/server/oauth';
import { db } from '$lib/server/db';
import { users, sessions } from '$lib/server/db/schema';
import { randomBytes } from 'node:crypto';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ cookies, url }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const cookieState = cookies.get('reparbre_state');
	const verifier = cookies.get('reparbre_verifier');

	if (!code || !state || state !== cookieState || !verifier) {
		return new Response('Paramètres OAuth invalides', { status: 400 });
	}

	try {
		const google = getGoogleClient();
		const tokens = await google.validateAuthorizationCode(code, verifier);
		const accessToken = tokens.accessToken();

		// Récupérer le profil Google
		const res = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
			headers: { Authorization: `Bearer ${accessToken}` }
		});
		if (!res.ok) {
			return new Response('Impossible de récupérer le profil Google', { status: 500 });
		}
		const profil = (await res.json()) as {
			sub: string;
			email: string;
			name: string;
			picture?: string;
		};

		// Chercher ou créer l'utilisateur
		let user = (
			await db.select().from(users).where(eq(users.googleSub, profil.sub)).limit(1)
		)[0];
		if (!user) {
			user = (
				await db
					.insert(users)
					.values({
						id: randomBytes(16).toString('hex'),
						googleSub: profil.sub,
						email: profil.email,
						name: profil.name,
						avatarUrl: profil.picture ?? null
					})
					.returning()
			)[0];
		}

		// Créer la session
		const token = randomBytes(32).toString('base64url');
		const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
		await db.insert(sessions).values({ id: token, userId: user.id, expiresAt });

		cookies.set('reparbre_session', token, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 30 * 24 * 60 * 60
		});

		// Nettoyer les cookies OAuth
		cookies.delete('reparbre_state', { path: '/' });
		cookies.delete('reparbre_verifier', { path: '/' });

		redirect(302, '/');
	} catch (e) {
		// Les redirections SvelteKit sont des exceptions : il faut les re-lever
		if (e && typeof e === 'object' && 'status' in e && 'location' in e) throw e;
		console.error('Erreur OAuth:', e);
		return new Response('Erreur lors de la connexion', { status: 500 });
	}
};
