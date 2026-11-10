import { db } from './db/index';
import { trees, weeklyTrees, hugs } from './db/schema';
import { and, eq, gte, sql, desc } from 'drizzle-orm';

/** Rayon de validation GPS autour de l'arbre (mètres) */
export const RAYON_METRES = 50;
/** Durée minimale d'un câlin (secondes) */
export const DUREE_MIN_S = 300;
/** Points maximum par câlin */
export const POINTS_MAX = 15;

/** Le lundi de la semaine courante, au format YYYY-MM-DD */
export function getWeekStart(date = new Date()): string {
	const d = new Date(date);
	const jour = d.getDay();
	const diff = jour === 0 ? -6 : 1 - jour;
	d.setDate(d.getDate() + diff);
	return d.toISOString().slice(0, 10);
}

/** L'arbre proposé au câlin cette semaine, avec ses infos complètes */
export async function getArbreDeLaSemaine() {
	const week = getWeekStart();
	const rows = await db
		.select({ tree: trees })
		.from(weeklyTrees)
		.innerJoin(trees, eq(weeklyTrees.treeId, trees.id))
		.where(eq(weeklyTrees.weekStart, week))
		.limit(1);
	return rows[0]?.tree ?? null;
}

/** Distance entre deux points GPS, en mètres (formule de Haversine) */
export function distanceMetres(
	lat1: number,
	lng1: number,
	lat2: number,
	lng2: number
): number {
	const R = 6_371_000;
	const φ1 = (lat1 * Math.PI) / 180;
	const φ2 = (lat2 * Math.PI) / 180;
	const Δφ = ((lat2 - lat1) * Math.PI) / 180;
	const Δλ = ((lng2 - lng1) * Math.PI) / 180;
	const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
	return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Points gagnés pour une durée donnée : 1 pt / minute entamée, plafonné */
export function pointsPourDuree(dureeS: number): number {
	return Math.min(Math.floor(dureeS / 60), POINTS_MAX);
}

/** Le câlin en cours d'un utilisateur (statut "ouvert"), ou null */
export async function getHugEnCours(userId: string) {
	const rows = await db
		.select()
		.from(hugs)
		.where(and(eq(hugs.userId, userId), sql`${hugs.endedAt} IS NULL`))
		.orderBy(desc(hugs.startedAt))
		.limit(1);
	return rows[0] ?? null;
}

/** Câlins validés de l'utilisateur pour la semaine courante */
export async function getHugsSemaine(userId: string) {
	const week = getWeekStart();
	return db
		.select()
		.from(hugs)
		.where(
			and(
				eq(hugs.userId, userId),
				gte(hugs.startedAt, new Date(week)),
				sql`${hugs.endedAt} IS NOT NULL`
			)
		)
		.orderBy(desc(hugs.startedAt));
}

/** Total des points gagnés cette semaine par un utilisateur */
export async function getPointsSemaine(userId: string): Promise<number> {
	const week = getWeekStart();
	const rows = await db
		.select({ total: sql<number>`COALESCE(SUM(${hugs.points}), 0)` })
		.from(hugs)
		.where(and(eq(hugs.userId, userId), gte(hugs.startedAt, new Date(week))));
	return rows[0]?.total ?? 0;
}

/** Nombre total de câlins donnés à l'arbre de la semaine (tous utilisateurs) */
export async function getTotalHugsSemaine(): Promise<number> {
	const week = getWeekStart();
	const rows = await db
		.select({ count: sql<number>`count(*)` })
		.from(hugs)
		.where(eq(hugs.weekStart, week));
	return rows[0]?.count ?? 0;
}
