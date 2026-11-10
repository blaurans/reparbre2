import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { hugs, trees } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/login');

	const mesHugs = await db
		.select({
			id: hugs.id,
			startedAt: hugs.startedAt,
			durationS: hugs.durationS,
			points: hugs.points,
			arbre: trees.name
		})
		.from(hugs)
		.innerJoin(trees, eq(hugs.treeId, trees.id))
		.where(eq(hugs.userId, locals.user.id))
		.orderBy(desc(hugs.startedAt))
		.limit(50);

	const pointsTotal = mesHugs.reduce((t, h) => t + (h.points ?? 0), 0);

	return { user: locals.user, hugs: mesHugs, pointsTotal };
};
