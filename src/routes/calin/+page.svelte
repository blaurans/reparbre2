<script lang="ts">
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let lat = $state<number | null>(null);
	let lng = $state<number | null>(null);
	let gpsError = $state<string | null>(null);
	let gpsReady = $state(false);
	let timerS = $state(0);
	let hugEnCours = $state(false);
	let hugId = $state<string | null>(null);

	function demarrerTimer() {
		timerId = setInterval(() => (timerS += 1), 1000);
	}

	let timerId: ReturnType<typeof setInterval> | null = null;

	function formatTemps(s: number): string {
		const m = Math.floor(s / 60);
		const sec = s % 60;
		return `${m}:${sec.toString().padStart(2, '0')}`;
	}
</script>

<div class="space-y-6">
	<h1 class="text-2xl font-bold text-foret-100">Câliner l'arbre</h1>

	{#if !data.arbre}
		<div class="rounded-2xl bg-foret-900 p-6 text-center text-foret-300">
			Aucun arbre n'a été choisi cette semaine.
		</div>
	{:else if !gpsReady}
		<div class="rounded-2xl bg-foret-900 p-6 text-center">
			<p class="animate-pulse text-foret-300">{gpsError ?? '📍 Localisation en cours…'}</p>
		</div>
	{:else if !hugEnCours}
		<div class="rounded-2xl bg-foret-900 p-6 text-center">
			<div class="mb-3 text-5xl">🌳</div>
			<h2 class="text-lg font-semibold text-foret-100">{data.arbre.name}</h2>
			<p class="text-sm text-foret-400">{data.arbre.species}</p>
			<form
				method="POST"
				action="?/commencer"
				use:enhance
				onsubmit={() => {
					hugEnCours = true;
					demarrerTimer();
				}}
			>
				<input type="hidden" name="lat" value={lat ?? ''} />
				<input type="hidden" name="lng" value={lng ?? ''} />
				<button
					type="submit"
					class="mt-6 w-full rounded-2xl bg-foret-500 py-4 font-semibold text-foret-950 transition hover:bg-foret-400"
				>
					Commencer le câlin
				</button>
			</form>
		</div>
	{:else}
		<div class="rounded-2xl bg-foret-900 p-6 text-center">
			<p class="text-4xl font-bold text-soleil">{formatTemps(timerS)}</p>
			<p class="mt-2 text-sm text-foret-300">Câlin en cours… reste encore un peu !</p>
			<form method="POST" action="?/terminer" use:enhance class="mt-6">
				<input type="hidden" name="hugId" value={hugId ?? ''} />
				<input type="hidden" name="lat" value={lat ?? ''} />
				<input type="hidden" name="lng" value={lng ?? ''} />
				<button
					type="submit"
					class="w-full rounded-2xl bg-foret-500 py-4 font-semibold text-foret-950 transition hover:bg-foret-400"
				>
					Terminer le câlin
				</button>
			</form>
		</div>
	{/if}
</div>
