import type { LayoutServerLoad } from './$types';
import { estAdmin } from '$lib/server/admin';

export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		user: locals.user,
		estAdmin: locals.user ? estAdmin(locals.user.email) : false
	};
};
