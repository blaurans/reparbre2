<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let texte = $state('');
</script>

<div class="space-y-6">
	<h1 class="text-2xl font-bold text-foret-100">Mes intentions</h1>
	<p class="text-sm text-foret-300">
		Des promesses envers toi ou les autres, à réaliser quand tu te sens prêt.
	</p>

	<form
		method="POST"
		action="?/creer"
		use:enhance
		class="rounded-2xl bg-foret-900 p-5"
	>
		<input
			type="text"
			name="texte"
			bind:value={texte}
			placeholder="Ex : Appeler ma grand-mère"
			class="w-full rounded-xl bg-foret-800 px-4 py-3 text-foret-100 placeholder-foret-400 outline-none focus:ring-2 focus:ring-foret-500"
		/>
		<button
			type="submit"
			class="mt-3 w-full rounded-xl bg-foret-500 py-3 font-semibold text-foret-950 transition hover:bg-foret-400"
			disabled={texte.trim().length < 3}
		>
			Ajouter l'intention
		</button>
	</form>

	<section class="space-y-3">
		<h2 class="font-semibold text-foret-100">En cours</h2>
		{#each data.intentions.filter((i) => i.status === 'planned') as intention (intention.id)}
			<div class="flex items-center justify-between rounded-2xl bg-foret-900 p-4">
				<p class="text-foret-100">{intention.text}</p>
				<form method="POST" action="?/terminer" use:enhance>
					<input type="hidden" name="id" value={intention.id} />
					<button
						type="submit"
						class="rounded-full bg-foret-700 px-4 py-1.5 text-sm text-foret-100 transition hover:bg-foret-600"
					>
						Fait ✓
					</button>
				</form>
			</div>
		{:else}
			<p class="text-sm text-foret-400">Aucune intention en cours.</p>
		{/each}
	</section>
</div>
