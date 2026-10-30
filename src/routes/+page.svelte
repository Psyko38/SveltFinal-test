<script>
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import AddRestaurantForm from '#lib/component/AddRestaurantForm.svelte';
	import AddRestaurantSuccess from '#lib/component/AddRestaurantSuccess.svelte';
	import Map from '#lib/component/Map.svelte';
	import OwnerButton from '#lib/component/OwnerButton.svelte';
	import RestaurantPanel from '#lib/component/RestaurantPanel.svelte';
	import SearchBar from '#lib/component/SearchBar.svelte';
	import { coordinatesOf } from '#lib/coordinates.js';

	/** @type {import('./$types').PageProps} */
	let { data, form } = $props();

	/** @type {number | null} */
	let selectedId = $state(null);
	/** @type {number | null} */
	let detailId = $state(null);
	/** @type {import('#lib/types.js').MapCenter | null} */
	let focus = $state.raw(null);
	// The map center is initialized from the first load, then kept in sync with the map itself.
	// svelte-ignore state_referenced_locally
	/** @type {import('#lib/types.js').MapCenter | null} */
	let mapCenter = $state.raw(data.search.center);
	// svelte-ignore state_referenced_locally
	/** @type {import('#lib/types.js').MapCenter | null} */
	let ownerPosition = $state.raw(data.search.center);

	let ownerOpen = $state(page.url.searchParams.has('add'));
	/** @type {string | null} */
	let submittedName = $state(null);

	let detail = $derived(detailId === null ? null : (data.details[detailId] ?? null));
	let actionData = $derived(form && 'errors' in form ? form : null);

	$effect(() => {
		if (form && 'success' in form && form.success) {
			submittedName = form.name;
			ownerPosition = null;
		}
	});

	$effect(() => {
		if (ownerOpen && !submittedName && ownerPosition === null && mapCenter) {
			ownerPosition = mapCenter;
		}
	});

	/** @param {import('#lib/types.js').Restaurant} restaurant */
	function handleSelect(restaurant) {
		selectedId = restaurant.id;
		detailId = restaurant.id;
		focus = coordinatesOf(restaurant);
	}

	/** @param {import('#lib/types.js').MapMarker} marker */
	function handleMarkerClick(marker) {
		if (ownerOpen && !submittedName) {
			ownerPosition = { lat: marker.lat, lng: marker.lng };
			return;
		}

		selectedId = marker.id;
		detailId = marker.id;
		focus = { lat: marker.lat, lng: marker.lng };
	}

	/** @param {import('#lib/types.js').MapCenter} center */
	function handleMapClick(center) {
		if (ownerOpen && !submittedName) {
			ownerPosition = center;
		}
	}

	/** @param {import('#lib/types.js').MapCenter} center */
	function handleMapCenterChange(center) {
		mapCenter = center;
	}

	function closeDetail() {
		detailId = null;
	}

	/** @param {MouseEvent} event */
	function openOwner(event) {
		if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
			return;
		}

		event.preventDefault();
		ownerPosition = mapCenter;
		ownerOpen = true;
	}

	function closeOwner() {
		ownerOpen = false;
		submittedName = null;
		ownerPosition = null;
	}

	function resetOwnerForm() {
		submittedName = null;
		ownerPosition = mapCenter;
	}

	afterNavigate(closeDetail);
</script>

<Map
	markers={data.markers}
	center={data.search.center}
	radiusKm={data.search.mode === 'address' ? data.search.radiusKm : null}
	{focus}
	pick={ownerOpen ? ownerPosition : null}
	onMarkerClick={handleMarkerClick}
	onMapClick={handleMapClick}
	onCenterChange={handleMapCenterChange}
/>

<SearchBar radiusKm={data.search.radiusKm} />

{#if ownerOpen && !submittedName}
	<p class="map-pick-hint">
		<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path
				d="M12 21s6.2-5.4 6.2-10.2a6.2 6.2 0 1 0-12.4 0C5.8 15.6 12 21 12 21Z"
				stroke="currentColor"
				stroke-width="1.7"
				stroke-linejoin="round"
			></path>
			<circle cx="12" cy="10.6" r="2.2" fill="currentColor"></circle>
		</svg>
		Click the map to place your restaurant
	</p>
{/if}

{#if !ownerOpen}
	<OwnerButton onOpen={openOwner} />
{/if}

<RestaurantPanel
	lists={data.lists}
	search={data.search}
	{detail}
	{selectedId}
	onSelect={handleSelect}
	onBack={closeDetail}
/>

{#if ownerOpen}
	<div class="owner-popup" role="dialog" aria-labelledby="owner-popup-title">
		<header class="owner-popup-header">
			<div>
				<h2 id="owner-popup-title">Add your restaurant</h2>
				<p>Submit your venue to the curated Tastemap directory</p>
			</div>

			<button class="owner-popup-close" type="button" aria-label="Close" onclick={closeOwner}>
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

		{#if submittedName}
			<AddRestaurantSuccess name={submittedName} onClose={closeOwner} onReset={resetOwnerForm} />
		{:else}
			<AddRestaurantForm
				tags={data.addRestaurantTags}
				{actionData}
				position={ownerPosition}
				onclose={closeOwner}
			/>
		{/if}
	</div>
{/if}

<style>
	.map-pick-hint {
		position: fixed;
		bottom: 24px;
		left: 50%;
		z-index: 1050;
		display: flex;
		align-items: center;
		gap: 7px;
		padding: 9px 14px 9px 11px;
		border: 1px solid var(--color-line);
		border-radius: var(--radius-pill);
		background: var(--color-surface);
		box-shadow: 0 6px 24px rgb(20 26 21 / 14%);
		color: var(--color-ink);
		font-size: 11.5px;
		font-weight: 550;
		line-height: 1.3;
		transform: translateX(-50%);
		pointer-events: none;
	}

	.map-pick-hint svg {
		width: 15px;
		height: 15px;
		color: var(--color-detail-accent);
	}

	.owner-popup {
		position: fixed;
		inset: 0 0 0 auto;
		z-index: 1100;
		display: flex;
		flex-direction: column;
		width: var(--panel-width);
		height: 100dvh;
		overflow: hidden;
		border-left: 1px solid var(--color-line-strong);
		background: var(--color-canvas);
		box-shadow: -12px 0 32px rgb(24 30 24 / 6%);
		color: var(--color-ink);
	}

	.owner-popup-header {
		flex: none;
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 12px;
		padding: 16px 18px 14px;
		border-bottom: 1px solid var(--color-line);
		background: var(--color-canvas);
	}

	h2 {
		color: var(--color-ink-strong);
		font-size: 21px;
		font-weight: 750;
		letter-spacing: -0.045em;
		line-height: 1.15;
	}

	.owner-popup-header p {
		margin-top: 4px;
		color: var(--color-hint);
		font-size: 11.5px;
		line-height: 1.4;
	}

	.owner-popup-close {
		flex: none;
		display: grid;
		place-items: center;
		width: 30px;
		height: 30px;
		padding: 0;
		border: 1px solid var(--color-line);
		border-radius: 50%;
		background: var(--color-surface);
		color: var(--color-muted);
		cursor: pointer;
		transition:
			background-color 0.15s ease,
			color 0.15s ease;
	}

	.owner-popup-close:hover {
		background: var(--color-control-hover);
		color: var(--color-ink);
	}

	.owner-popup-close:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}

	.owner-popup-close svg {
		width: 15px;
		height: 15px;
	}

	@media (max-width: 700px) {
		.map-pick-hint {
			display: none;
		}

		.owner-popup {
			width: 100vw;
			border-left: 0;
		}

		.owner-popup-header {
			padding-right: 16px;
			padding-left: 16px;
		}

		h2 {
			font-size: 20px;
		}
	}
</style>
