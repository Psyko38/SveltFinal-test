const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTRIBUTION =
	'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const MAX_ZOOM = 19;
const DEFAULT_CENTER = { lat: 51.505, lng: -0.09 };
const DEFAULT_ZOOM = 13;
const RADIUS_ZOOM = 12;
const FOCUS_ZOOM = 15;
const RADIUS_STYLE = {
	color: '#2563eb',
	weight: 2,
	fillColor: '#3b82f6',
	fillOpacity: 0.08
};

/**
 * @typedef {object} MapView
 * @property {import('#lib/types.js').MapMarker[]} [markers]
 * @property {import('#lib/types.js').MapCenter | null} [center]
 * @property {number | null} [radiusKm]
 * @property {import('#lib/types.js').MapCenter | null} [focus]
 * @property {import('#lib/types.js').MapCenter | null} [pick]
 * @property {((marker: import('#lib/types.js').MapMarker) => void) | null} [onMarkerClick]
 * @property {((center: import('#lib/types.js').MapCenter) => void) | null} [onMapClick]
 * @property {((center: import('#lib/types.js').MapCenter) => void) | null} [onCenterChange]
 */

/**
 * Own the whole map: create it once, render every view change and clean it up.
 * @param {() => MapView} getView
 * @returns {import('svelte/attachments').Attachment<HTMLDivElement>}
 */
export function mapAttachment(getView) {
	return (element) => {
		let active = true;

		/** @type {Awaited<ReturnType<typeof createMap>> | null} */
		let controller = null;

		createMap(element, {
			onMarkerClick: (marker) => getView().onMarkerClick?.(marker),
			onMapClick: (center) => getView().onMapClick?.(center),
			onCenterChange: (center) => getView().onCenterChange?.(center)
		})
			.then((instance) => {
				if (!active) {
					instance.destroy();
					return;
				}

				controller = instance;
				controller.render(getView());
			})
			.catch((error) => {
				console.error('Failed to initialize the map', error);
			});

		$effect(() => {
			const view = getView();
			controller?.render(view);
		});

		return () => {
			active = false;
			controller?.destroy();
			controller = null;
		};
	};
}

/**
 * @param {HTMLElement} element
 * @param {{
 *   onMarkerClick?: ((marker: import('#lib/types.js').MapMarker) => void) | null,
 *   onMapClick?: ((center: import('#lib/types.js').MapCenter) => void) | null,
 *   onCenterChange?: ((center: import('#lib/types.js').MapCenter) => void) | null
 * }} [options]
 */
async function createMap(
	element,
	{ onMarkerClick = null, onMapClick = null, onCenterChange = null } = {}
) {
	const { default: L } = await import('leaflet');

	const map = L.map(element).setView([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], DEFAULT_ZOOM);

	L.tileLayer(TILE_URL, { maxZoom: MAX_ZOOM, attribution: ATTRIBUTION }).addTo(map);

	const markerLayer = L.layerGroup().addTo(map);

	const pickIcon = L.divIcon({
		className: 'restaurant-position-marker',
		html: '<span style="display:block;width:16px;height:16px;border:3px solid #fff;border-radius:50%;background:#3e6b48;box-shadow:0 1px 6px rgb(20 26 21 / 45%);"></span>',
		iconSize: [22, 22],
		iconAnchor: [11, 11]
	});

	/** @type {any} */
	let circle = null;
	/** @type {any} */
	let pickMarker = null;
	/** @type {import('#lib/types.js').MapCenter | null | undefined} */
	let lastPick;

	map.on('click', (/** @type {any} */ event) => {
		onMapClick?.({ lat: event.latlng.lat, lng: event.latlng.lng });
	});

	map.on('moveend', () => {
		const center = map.getCenter();
		onCenterChange?.({ lat: center.lat, lng: center.lng });
	});
	/** @type {import('#lib/types.js').MapMarker[] | null} */
	let lastMarkers = null;
	/** @type {import('#lib/types.js').MapCenter | null | undefined} */
	let lastCenter;
	/** @type {number | null | undefined} */
	let lastRadius;
	/** @type {import('#lib/types.js').MapCenter | null | undefined} */
	let lastFocus;

	/**
	 * The only function that touches the map.
	 * @param {MapView} view
	 */
	function render({ markers = [], center = null, radiusKm = null, focus = null, pick = null }) {
		if (markers !== lastMarkers) {
			markerLayer.clearLayers();

			for (const marker of markers) {
				L.marker([marker.lat, marker.lng])
					.addTo(markerLayer)
					.bindTooltip(marker.label, { permanent: true, direction: 'top' })
					.on('click', () => onMarkerClick?.(marker));
			}

			lastMarkers = markers;
		}

		if (center !== lastCenter || radiusKm !== lastRadius) {
			circle?.remove();
			circle = null;

			if (center) {
				map.setView([center.lat, center.lng], radiusKm ? RADIUS_ZOOM : DEFAULT_ZOOM);

				if (radiusKm) {
					circle = L.circle([center.lat, center.lng], {
						radius: radiusKm * 1000,
						...RADIUS_STYLE
					}).addTo(map);
				}
			}

			lastCenter = center;
			lastRadius = radiusKm;
		}

		if (focus !== lastFocus) {
			if (focus) map.flyTo([focus.lat, focus.lng], FOCUS_ZOOM);
			lastFocus = focus;
		}

		if (pick !== lastPick) {
			pickMarker?.remove();
			pickMarker = null;

			if (pick) {
				pickMarker = L.marker([pick.lat, pick.lng], {
					icon: pickIcon,
					interactive: false,
					zIndexOffset: 1000,
					title: 'Restaurant position'
				}).addTo(map);
			}

			lastPick = pick;
		}
	}

	function destroy() {
		circle?.remove();
		pickMarker?.remove();
		markerLayer.clearLayers();
		map.remove();
	}

	return { render, destroy };
}
