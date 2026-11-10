import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import {
	getArbreDeLaSemaine,
	getWeekStart,
	distanceMetres,
	RAYON_METRES,
	DUREE_MIN_S,
	pointsPourDuree
} from '$lib/server/game';
import { hugs } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/login');
	const arbre = await getArbreDeLaSemaine();
	return { arbre };
};

export const actions: Actions = {
	/** Démarre un câlin : vérifie le GPS et crée la ligne en base */
	commencer: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { erreur: 'Non connecté' });

		const data = await request.formData();
		const lat = parseFloat(data.get('lat') as string);
		const lng = parseFloat(data.get('lng') as string);

		if (Number.isNaN(lat) || Number.isNaN(lng)) {
			return fail(400, { erreur: 'Position GPS invalide' });
		}

		const arbre = await getArbreDeLaSemaine();
		if (!arbre) return fail(400, { erreur: 'Aucun arbre à câliner cette semaine.' });

		const dist = distanceMetres(lat, lng, arbre.lat, arbre.lng);
		if (dist > RAYON_METRES) {
			return fail(400, {
				erreur: `Tu es trop loin de l'arbre (${Math.round(dist)} m). Approche-toi !`
			});
		}

		const hugId = crypto.randomUUID();
		await db.insert(hugs).values({
			id: hugId,
			userId: locals.user.id,
			treeId: arbre.id,
			weekStart: getWeekStart(),
			startedAt: new Date(),
			lat,
			lng
		});

		return { succes: true, hugId };
	},

	/** Termine un câlin : vérifie la durée minimale et calcule les points */
	terminer: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { erreur: 'Non connecté' });

		const data = await request.formData();
		const hugId = data.get('hugId') as string;
		const lat = parseFloat(data.get('lat') as string);
		const lng = parseFloat(data.get('lng') as string);

		if (!hugId) return fail(400, { erreur: 'Câlin introuvable' });

		const rows = await db.select().from(hugs).where(eq(hugs.id, hugId)).limit(1);
		const hug = rows[0];
		if (!hug || hug.userId !== locals.user.id) {
			return fail(404, { erreur: 'Câlin introuvable' });
		}
		if (hug.endedAt) return fail(400, { erreur: 'Câlin déjà terminé' });

		const now = new Date();
		const dureeS = Math.floor((now.getTime() - hug.startedAt.getTime()) / 1000);

		if (dureeS < DUREE_MIN_S) {
			return fail(400, {
				erreur: `Un câlin, ça se mérite : reste encore ${Math.ceil((DUREE_MIN_S - dureeS) / 60)} minute(s) 🌳`
			});
		}

		const points = pointsPourDuree(dureeS);
		await db
			.update(hugs)
			.set({ endedAt: now, durationS: dureeS, points, lat, lng })
			.where(eq(hugs.id, hugId));

		return { succes: true, points };
	}
};
