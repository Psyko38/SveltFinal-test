<script>
	import 'leaflet/dist/leaflet.css';
	import './style.css';

	import favicon from '#lib/assets/favicon.svg';

	/** @type {{children: import('svelte').Snippet}} */
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Tastemap — Your top tables</title>
</svelte:head>

{@render children()}
