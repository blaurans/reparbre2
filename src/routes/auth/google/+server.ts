import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';
import { getGoogleClient } from '$lib/server/oauth';
import { createState, createPkce } from '$lib/server/pkce';

export const GET: RequestHandler = async ({ cookies }) => {
	const state = createState();
	const { verifier, challenge } = createPkce();

	cookies.set('reparbre_state', state, {
		path: '/',
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		maxAge: 600
	});
	cookies.set('reparbre_verifier', verifier, {
		path: '/',
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		maxAge: 600
	});

	const google = getGoogleClient();
	const url = google.createAuthorizationURL(state, verifier, [
		'openid',
		'email',
		'profile'
	]);

	redirect(302, url.toString());
};
