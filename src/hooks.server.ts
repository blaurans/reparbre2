import type { Handle } from '@sveltejs/kit';
import { getUserFromToken, SESSION_COOKIE } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get(SESSION_COOKIE);
	if (token) {
		const user = await getUserFromToken(token);
		if (user) {
			event.locals.user = user;
		} else {
			// Token expiré ou invalide : on nettoie
			event.cookies.delete(SESSION_COOKIE, { path: '/' });
		}
	}
	return resolve(event);
};
