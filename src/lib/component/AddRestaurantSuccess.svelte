<script>
	import { resolve } from '$app/paths';

	/**
	 * @type {{
	 *   name: string,
	 *   onClose?: (() => void) | null,
	 *   onReset?: (() => void) | null
	 * }}
	 */
	let { name, onClose = null, onReset = null } = $props();
</script>

<div class="success" role="status">
	<span class="success-mark" aria-hidden="true">
		<svg viewBox="0 0 24 24" fill="none">
			<path
				d="m6.5 12.3 3.6 3.5 7.4-8"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			></path>
		</svg>
	</span>

	<h2>Thanks — it’s with our editors</h2>
	<p>
		<strong>{name}</strong> has been submitted to the Tastemap directory. We’ll review the details and
		photography before it goes live.
	</p>
</div>

<footer class="footer">
	<a
		class="button cancel"
		href={resolve('/')}
		onclick={(event) => {
			if (onClose) {
				event.preventDefault();
				onClose();
			}
		}}>Back to the map</a
	>
	<a
		class="button publish"
		href={resolve('/add-restaurant')}
		onclick={(event) => {
			if (onReset) {
				event.preventDefault();
				onReset();
			}
		}}>Add another</a
	>
</footer>

<style>
	.success {
		display: flex;
		flex: 1;
		flex-direction: column;
		align-items: center;
		min-height: 0;
		padding: 46px 26px 52px;
		text-align: center;
		overflow-y: auto;
	}

	.success-mark {
		display: grid;
		place-items: center;
		width: 52px;
		height: 52px;
		margin-bottom: 18px;
		border-radius: 50%;
		background: #eaf0e7;
		color: var(--color-detail-accent);
	}

	.success-mark svg {
		width: 26px;
		height: 26px;
	}

	h2 {
		color: var(--color-ink-strong);
		font-size: 20px;
		font-weight: 750;
		letter-spacing: -0.035em;
	}

	p {
		max-width: 34em;
		margin-top: 8px;
		color: var(--color-muted);
		font-size: 12.5px;
		line-height: 1.6;
	}

	strong {
		color: var(--color-ink);
		font-weight: 650;
	}

	.footer {
		flex: none;
		display: grid;
		grid-template-columns: 1fr 1.75fr;
		gap: 9px;
		padding: 12px 18px calc(12px + env(safe-area-inset-bottom));
		border-top: 1px solid var(--color-line);
		background: var(--color-canvas);
	}

	.button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		height: 42px;
		border-radius: var(--radius-pill);
		font-size: 12.5px;
		font-weight: 600;
		letter-spacing: -0.005em;
		text-decoration: none;
		cursor: pointer;
		transition:
			background-color 0.15s ease,
			border-color 0.15s ease;
	}

	.button:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}

	.button.cancel {
		border: 1px solid var(--color-line);
		background: var(--color-surface);
		color: var(--color-ink);
	}

	.button.cancel:hover {
		background: var(--color-control-hover);
	}

	.button.publish {
		background: var(--color-detail-accent);
		color: #fff;
	}

	.button.publish:hover {
		background: var(--color-detail-accent-hover);
	}

	@media (max-width: 700px) {
		.footer {
			padding-right: 16px;
			padding-left: 16px;
		}
	}
</style>
