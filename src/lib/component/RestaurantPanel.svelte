<script>
	import { formatDistance } from '#lib/format.js';
	import RestaurantDetail from '#lib/component/RestaurantDetail.svelte';
	import RestaurantList from '#lib/component/RestaurantList.svelte';

	/**
	 * @type {{
	 *   lists: import('#lib/types.js').RestaurantList[],
	 *   search: import('#lib/types.js').SearchInfo,
	 *   detail?: import('#lib/types.js').RestaurantDetail | null,
	 *   selectedId?: number | null,
	 *   onSelect?: ((restaurant: import('#lib/types.js').Restaurant) => void) | null,
	 *   onBack?: (() => void) | null
	 * }}
	 */
	let {
		lists,
		search,
		detail = null,
		selectedId = null,
		onSelect = null,
		onBack = null
	} = $props();

	let open = $state(true);
</script>

{#if open}
	<aside
		class={['panel', { 'detail-mode': detail !== null }]}
		aria-label={detail ? `${detail.name} details` : 'Your top tables'}
	>
		{#if detail}
			<RestaurantDetail {detail} {onBack} />
		{:else}
			<header class="header">
				<p class="brand">Tastemap.</p>
				<button
					class="close"
					type="button"
					aria-label="Hide the list"
					onclick={() => (open = false)}
				>
					<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
						<path
							d="m6 6 12 12M18 6 6 18"
							stroke="currentColor"
							stroke-width="1.7"
							stroke-linecap="round"
						></path>
					</svg>
				</button>
			</header>

			<p class="context">
				<span class="status-dot" aria-hidden="true"></span>
				<span>{search.city}</span>
				<span class="sep" aria-hidden="true">·</span>
				<span>{formatDistance(search.radiusKm)} radius</span>
			</p>

			<h1>Your top tables</h1>
			<p class="intro">
				Ranked head-to-head — your #3 really is better than your #4. No five-star mush.
			</p>

			<RestaurantList {lists} {selectedId} {onSelect} />

			<p class="hint">Select a place to find it on the map.</p>
		{/if}
	</aside>
{:else}
	<button class="reopen" type="button" aria-label="Show the list" onclick={() => (open = true)}>
		Tastemap.
	</button>
{/if}

<style>
	.panel {
		position: fixed;
		inset: 0 auto 0 0;
		z-index: 10;
		display: flex;
		flex-direction: column;
		width: var(--panel-width);
		height: 100dvh;
		padding: 14px 12px 0;
		overflow: hidden;
		background: var(--color-canvas);
		border-right: 1px solid var(--color-line-strong);
		box-shadow: var(--shadow-panel);
		color: var(--color-ink);
	}

	.panel.detail-mode {
		padding: 0;
	}

	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}

	.brand {
		margin: 0;
		color: var(--color-ink-strong);
		font-size: 17px;
		font-weight: 750;
		letter-spacing: -0.045em;
		line-height: 1.2;
	}

	.close {
		display: grid;
		place-items: center;
		width: 28px;
		height: 28px;
		margin: -4px -4px -4px 0;
		padding: 0;
		border: 0;
		border-radius: 50%;
		background: transparent;
		color: var(--color-muted);
		cursor: pointer;
		transition:
			background-color 0.15s ease,
			color 0.15s ease;
	}

	.close:hover {
		background: var(--color-close-hover);
		color: var(--color-ink);
	}

	.close:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 1px;
	}

	.close svg {
		width: 14px;
		height: 14px;
	}

	.context {
		display: flex;
		align-items: center;
		gap: 5px;
		margin: 10px 0 0;
		color: var(--color-muted);
		font-size: 10.5px;
		line-height: 1.4;
	}

	.status-dot {
		flex: none;
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: var(--color-status);
	}

	.sep {
		color: var(--color-separator);
	}

	h1 {
		margin: 11px 0 7px;
		color: var(--color-ink-strong);
		font-size: clamp(25px, 2.2vw, 31px);
		font-weight: 750;
		letter-spacing: -0.05em;
		line-height: 1.02;
	}

	.intro {
		max-width: 100%;
		margin: 0 0 13px;
		color: var(--color-muted);
		font-size: 11.5px;
		line-height: 1.55;
	}

	.hint {
		flex: none;
		margin: 0 -12px;
		padding: 11px 12px 13px;
		border-top: 1px solid var(--color-line);
		color: var(--color-hint);
		font-size: 9.5px;
		line-height: 1.4;
		text-align: center;
	}

	.reopen {
		position: fixed;
		top: 14px;
		left: 14px;
		z-index: 20;
		padding: 8px 12px;
		border: 1px solid var(--color-line);
		border-radius: var(--radius-pill);
		background: var(--color-surface);
		box-shadow: var(--shadow-reopen);
		color: var(--color-ink-strong);
		font-size: 14px;
		font-weight: 750;
		letter-spacing: -0.04em;
		cursor: pointer;
	}

	@media (max-width: 700px) {
		.panel {
			width: 100vw;
			padding-top: 72px;
			border-right: 0;
		}

		.panel.detail-mode {
			padding: 72px 0 0;
		}

		.reopen {
			top: 72px;
		}
	}
</style>
