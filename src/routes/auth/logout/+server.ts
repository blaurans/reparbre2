import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';
import { SESSION_COOKIE, destroySession } from '$lib/server/auth';

export const GET: RequestHandler = async ({ cookies }) => {
	const token = cookies.get(SESSION_COOKIE);
	if (token) {
		await destroySession(token);
	}
	cookies.delete(SESSION_COOKIE, { path: '/' });
	redirect(302, '/');
};
