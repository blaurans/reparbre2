<script lang="ts">
	let { data } = $props();

	function formatDuree(s: number | null): string {
		if (!s) return '—';
		const m = Math.floor(s / 60);
		return `${m} min`;
	}

	function formatDate(d: Date | string | null): string {
		if (!d) return '—';
		return new Date(d).toLocaleDateString('fr-FR', {
			weekday: 'long',
			day: 'numeric',
			month: 'long'
		});
	}
</script>

<div class="space-y-6">
	<section class="rounded-3xl bg-foret-900 p-6 text-center shadow-lg">
		<div class="mx-auto mb-3 text-6xl">🌳</div>
		<h1 class="text-2xl font-bold text-foret-100">{data.user?.name}</h1>
		<p class="text-sm text-foret-400">{data.user?.email}</p>
	</section>

	<section class="grid grid-cols-2 gap-3">
		<div class="rounded-2xl bg-foret-900 p-4 text-center">
			<p class="text-3xl font-bold text-soleil">{data.pointsTotal}</p>
			<p class="text-xs text-foret-300">points gagnés</p>
		</div>
		<div class="rounded-2xl bg-foret-900 p-4 text-center">
			<p class="text-3xl font-bold text-foret-200">{data.hugs.length}</p>
			<p class="text-xs text-foret-300">câlins donnés</p>
		</div>
	</section>

	<section class="space-y-3">
		<h2 class="font-semibold text-foret-100">Mon historique</h2>
		{#each data.hugs as hug (hug.id)}
			<div class="rounded-2xl bg-foret-900 p-4">
				<p class="font-medium text-foret-100">{hug.arbre}</p>
				<p class="text-xs text-foret-400">
					{formatDate(hug.startedAt)} · {formatDuree(hug.durationS)} · {hug.points ?? 0} pts
				</p>
			</div>
		{:else}
			<p class="text-sm text-foret-400">Aucun câlin pour l'instant. Va câliner un arbre !</p>
		{/each}
	</section>

	<a
		href="/auth/logout"
		class="block rounded-2xl bg-foret-900 py-3 text-center text-sm text-foret-300 transition hover:bg-foret-800"
	>
		Se déconnecter
	</a>
</div>
