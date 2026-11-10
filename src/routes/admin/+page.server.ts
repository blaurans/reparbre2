import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { trees, weeklyTrees } from '$lib/server/db/schema';
import { estAdmin } from '$lib/server/admin';
import { getWeekStart } from '$lib/server/game';
import { desc, eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/login');
	if (!estAdmin(locals.user.email)) redirect(302, '/');

	// Tous les arbres + l'arbre choisi pour la semaine courante
	const tousLesArbres = await db.select().from(trees).orderBy(desc(trees.createdAt));
	const week = getWeekStart();
	const choix = await db
		.select()
		.from(weeklyTrees)
		.where(eq(weeklyTrees.weekStart, week))
		.limit(1);

	return {
		arbres: tousLesArbres,
		arbreSemaineId: choix[0]?.treeId ?? null,
		week
	};
};

export const actions: Actions = {
	/** Ajoute un nouvel arbre */
	creer: async ({ request, locals }) => {
		if (!locals.user || !estAdmin(locals.user.email)) {
			return fail(403, { erreur: 'Accès refusé' });
		}

		const data = await request.formData();
		const name = (data.get('name') as string)?.trim();
		const species = (data.get('species') as string)?.trim();
		const lat = parseFloat(data.get('lat') as string);
		const lng = parseFloat(data.get('lng') as string);
		const address = (data.get('address') as string)?.trim() || null;
		const description = (data.get('description') as string)?.trim() || null;
		const photoUrl = (data.get('photoUrl') as string)?.trim() || null;

		if (!name || !species || Number.isNaN(lat) || Number.isNaN(lng)) {
			return fail(400, { erreur: 'Nom, espèce, latitude et longitude sont obligatoires' });
		}

		await db.insert(trees).values({
			id: crypto.randomUUID(),
			name,
			species,
			lat,
			lng,
			address,
			description,
			photoUrl
		});

		return { succes: true };
	},

	/** Choisit l'arbre de la semaine */
	choisir: async ({ request, locals }) => {
		if (!locals.user || !estAdmin(locals.user.email)) {
			return fail(403, { erreur: 'Accès refusé' });
		}

		const data = await request.formData();
		const treeId = data.get('treeId') as string;
		if (!treeId) return fail(400, { erreur: 'Arbre manquant' });

		const week = getWeekStart();
		// Un seul choix par semaine : on remplace s'il existe déjà
		await db
			.delete(weeklyTrees)
			.where(eq(weeklyTrees.weekStart, week));
		await db.insert(weeklyTrees).values({ id: crypto.randomUUID(), treeId, weekStart: week });

		return { succes: true };
	}
};
