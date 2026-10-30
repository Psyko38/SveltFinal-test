<script>
	import { onDestroy } from 'svelte';
	import { page } from '$app/state';
	import { formatDistance } from '#lib/format.js';

	const DEBOUNCE_MS = 300;

	/** @type {{ radiusKm?: number }} */
	let { radiusKm = 1 } = $props();

	/** @type {ReturnType<typeof setTimeout> | undefined} */
	let timer;

	let query = $derived(page.url.searchParams.get('q') ?? '');
	let radiusLabel = $derived(`${formatDistance(radiusKm)} radius`);

	/** @param {HTMLFormElement | null} form */
	function searchSoon(form) {
		clearTimeout(timer);
		timer = setTimeout(() => form?.requestSubmit(), DEBOUNCE_MS);
	}

	onDestroy(() => clearTimeout(timer));
</script>

<form
	class="search"
	role="search"
	aria-label="Search restaurants and addresses"
	data-sveltekit-reset="false"
	data-sveltekit-replacestate
	onsubmit={() => clearTimeout(timer)}
>
	<svg class="search-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
		<circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8"></circle>
		<path d="m16.5 16.5 4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
	</svg>

	<input
		type="text"
		name="q"
		value={query}
		aria-label="Address or restaurant"
		placeholder="Search an address or restaurant"
		autocomplete="off"
		enterkeyhint="search"
		oninput={(event) => searchSoon(event.currentTarget.form)}
	/>

	<button class="radius" type="submit" aria-label="Search within this radius">
		<span>{radiusLabel}</span>
		<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path
				d="M7 17 17 7M9 7h8v8"
				stroke="currentColor"
				stroke-width="1.8"
				stroke-linecap="round"
				stroke-linejoin="round"
			></path>
		</svg>
	</button>
</form>

<style>
	form {
		position: fixed;
		top: 14px;
		left: 50%;
		z-index: 1000;
		display: flex;
		align-items: center;
		gap: 8px;
		width: clamp(260px, 34vw, 440px);
		height: 46px;
		padding: 4px 5px 4px 15px;
		border-radius: var(--radius-pill);
		background: var(--color-surface);
		box-shadow:
			0 6px 24px rgb(20 26 21 / 14%),
			0 0 0 1px rgb(20 26 21 / 5%);
		color: var(--color-ink);
		transform: translateX(-50%);
		transition: box-shadow 0.18s ease;
	}

	form:focus-within {
		box-shadow:
			0 6px 24px rgb(20 26 21 / 16%),
			0 0 0 3px rgb(47 74 57 / 14%);
	}

	.search-icon {
		flex: none;
		width: 17px;
		height: 17px;
		color: var(--color-muted);
	}

	input {
		flex: 1;
		min-width: 0;
		height: 100%;
		padding: 0;
		border: 0;
		outline: 0;
		background: transparent;
		color: var(--color-ink);
		font-size: 13px;
		letter-spacing: -0.01em;
	}

	input::placeholder {
		color: var(--color-placeholder);
		opacity: 1;
	}

	.radius {
		flex: none;
		display: flex;
		align-items: center;
		gap: 6px;
		height: 36px;
		padding: 0 11px 0 12px;
		border: 1px solid var(--color-line-soft);
		border-radius: var(--radius-pill);
		background: var(--color-control);
		color: var(--color-control-ink);
		font-size: 11px;
		font-weight: 550;
		letter-spacing: -0.01em;
		white-space: nowrap;
		cursor: pointer;
		transition:
			background-color 0.15s ease,
			border-color 0.15s ease;
	}

	.radius:hover {
		border-color: var(--color-line);
		background: var(--color-control-hover);
	}

	.radius:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}

	.radius svg {
		width: 12px;
		height: 12px;
	}

	@media (max-width: 700px) {
		form {
			width: calc(100vw - 28px);
			max-width: 420px;
		}
	}
</style>
