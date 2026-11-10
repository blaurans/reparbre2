import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { trees, weeklyTrees } from '$lib/server/db/schema';
import { estAdmin } from '$lib/server/admin';
import { getWeekStart } from '$lib/server/game';
import { DATA_DIR } from '$lib/server/paths';
import { desc, eq } from 'drizzle-orm';
import fs from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';

const TAILLE_MAX = 5 * 1024 * 1024; // 5 Mo
const EXTENSIONS_OK = ['.jpg', '.jpeg', '.png', '.webp'];

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/login');
	if (!estAdmin(locals.user.email)) redirect(302, '/');

	const tousLesArbres = await db.select().from(trees).orderBy(desc(trees.createdAt));
	const week = getWeekStart();
	const choix = await db
		.select()
		.from(weeklyTrees)
		.where(eq(weeklyTrees.weekStart, week))
		.limit(1);

	return { arbres: tousLesArbres, arbreSemaineId: choix[0]?.treeId ?? null, week };
};

export const actions: Actions = {
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

		if (!name || !species || Number.isNaN(lat) || Number.isNaN(lng)) {
			return fail(400, { erreur: 'Nom, espèce, latitude et longitude sont obligatoires' });
		}

		// Traitement de la photo uploadée
		let photoUrl: string | null = null;
		const photo = data.get('photo') as File | null;

		if (photo && photo.size > 0) {
			if (photo.size > TAILLE_MAX) {
				return fail(400, { erreur: 'Photo trop lourde (5 Mo maximum)' });
			}

			const ext = path.extname(photo.name).toLowerCase();
			if (!EXTENSIONS_OK.includes(ext)) {
				return fail(400, { erreur: 'Format accepté : JPG, PNG ou WebP' });
			}

			// Nom aléatoire : évite collisions et injections de chemin
			const nomFichier = `${randomBytes(16).toString('hex')}${ext}`;
			const dossierUploads = path.join(DATA_DIR, 'uploads');
			fs.mkdirSync(dossierUploads, { recursive: true });
			fs.writeFileSync(
				path.join(dossierUploads, nomFichier),
				Buffer.from(await photo.arrayBuffer())
			);
			photoUrl = `/uploads/${nomFichier}`;
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

	choisir: async ({ request, locals }) => {
		if (!locals.user || !estAdmin(locals.user.email)) {
			return fail(403, { erreur: 'Accès refusé' });
		}

		const data = await request.formData();
		const treeId = data.get('treeId') as string;
		if (!treeId) return fail(400, { erreur: 'Arbre manquant' });

		const week = getWeekStart();
		await db.delete(weeklyTrees).where(eq(weeklyTrees.weekStart, week));
		await db.insert(weeklyTrees).values({ id: crypto.randomUUID(), treeId, weekStart: week });

		return { succes: true };
	}
};
