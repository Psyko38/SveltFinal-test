<script>
	import { mapAttachment } from '#lib/map.svelte.js';

	/**
	 * @type {{
	 *   markers?: import('#lib/types.js').MapMarker[],
	 *   center?: import('#lib/types.js').MapCenter | null,
	 *   radiusKm?: number | null,
	 *   focus?: import('#lib/types.js').MapCenter | null,
	 *   pick?: import('#lib/types.js').MapCenter | null,
	 *   onMarkerClick?: ((marker: import('#lib/types.js').MapMarker) => void) | null,
	 *   onMapClick?: ((center: import('#lib/types.js').MapCenter) => void) | null,
	 *   onCenterChange?: ((center: import('#lib/types.js').MapCenter) => void) | null
	 * }}
	 */
	let {
		markers = [],
		center = null,
		radiusKm = null,
		focus = null,
		pick = null,
		onMarkerClick = null,
		onMapClick = null,
		onCenterChange = null
	} = $props();

	let view = $derived({
		markers,
		center,
		radiusKm,
		focus,
		pick,
		onMarkerClick,
		onMapClick,
		onCenterChange
	});
</script>

<div class="map" {@attach mapAttachment(() => view)}></div>

<style>
	.map {
		position: fixed;
		inset: 0;
		z-index: 0;
	}
</style>
