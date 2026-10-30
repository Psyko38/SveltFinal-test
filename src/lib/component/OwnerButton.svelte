<script>
	import { resolve } from '$app/paths';

	/** @type {{ onOpen?: ((event: MouseEvent) => void) | null }} */
	let { onOpen = null } = $props();
</script>

<a class="owner" href={resolve('/add-restaurant')} onclick={onOpen ?? undefined}>
	<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
		<path
			d="M4.6 10.6v9.1h14.8v-9.1"
			stroke="currentColor"
			stroke-width="1.7"
			stroke-linecap="round"
			stroke-linejoin="round"
		></path>
		<path
			d="M3.2 10.6V6.9a2.7 2.7 0 0 1 2.7-2.7h12.2a2.7 2.7 0 0 1 2.7 2.7v3.7"
			stroke="currentColor"
			stroke-width="1.7"
			stroke-linecap="round"
			stroke-linejoin="round"
		></path>
		<path d="M3.2 10.6h17.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"></path>
		<path
			d="M8.4 4.4v6.2M12 4.4v6.2M15.6 4.4v6.2"
			stroke="currentColor"
			stroke-width="1.7"
			stroke-linecap="round"
		></path>
	</svg>
	<span>Owner of restaurant ?</span>
</a>

<style>
	.owner {
		position: fixed;
		top: 14px;
		right: 14px;
		z-index: 1000;
		display: inline-flex;
		align-items: center;
		gap: 9px;
		height: 46px;
		padding: 0 18px 0 16px;
		border: 0;
		border-radius: var(--radius-pill);
		background: var(--color-detail-accent);
		box-shadow:
			0 6px 24px rgb(20 26 21 / 14%),
			0 0 0 1px rgb(20 26 21 / 5%);
		color: #fff;
		font-size: 13.5px;
		font-weight: 550;
		letter-spacing: -0.01em;
		white-space: nowrap;
		text-decoration: none;
		cursor: pointer;
		transition:
			background-color 0.15s ease,
			box-shadow 0.15s ease;
	}

	.owner:hover {
		background: var(--color-detail-accent-hover);
	}

	.owner:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}

	.owner svg {
		flex: none;
		width: 19px;
		height: 19px;
	}

	@media (max-width: 700px) {
		/* Sit below the search field; the list panel covers it when open. */
		.owner {
			top: 72px;
			right: 14px;
			z-index: 5;
			height: 40px;
			padding: 0 15px 0 13px;
			font-size: 12.5px;
		}

		.owner svg {
			width: 17px;
			height: 17px;
		}
	}
</style>
