import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { intentions } from '$lib/server/db/schema';
import { and, eq } from 'drizzle-orm';

export const load = async ({ locals }) => {
	if (!locals.user) redirect(302, '/login');

	const mesIntentions = await db
		.select()
		.from(intentions)
		.where(eq(intentions.userId, locals.user.id));

	return { intentions: mesIntentions };
};

export const actions = {
	creer: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { erreur: 'Non connecté' });

		const data = await request.formData();
		const texte = (data.get('texte') as string)?.trim();

		if (!texte || texte.length < 3) {
			return fail(400, { erreur: 'Intention trop courte (3 caractères minimum)' });
		}

		await db.insert(intentions).values({
			id: crypto.randomUUID(),
			userId: locals.user.id,
			text: texte,
			cost: 10,
			status: 'planned'
		});

		return { succes: true };
	},

	terminer: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { erreur: 'Non connecté' });

		const data = await request.formData();
		const id = data.get('id') as string;
		if (!id) return fail(400, { erreur: 'Intention introuvable' });

		await db
			.update(intentions)
			.set({ status: 'done', doneAt: new Date() })
			.where(and(eq(intentions.id, id), eq(intentions.userId, locals.user.id)));

		return { succes: true };
	}
};
