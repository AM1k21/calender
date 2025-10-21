<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Meeting Room Reservations</title>
	<meta name="description" content="Reserve meeting rooms for your team" />
</svelte:head>

<nav class="main-nav">
	<div class="container">
		<div class="nav-content">
			<a href="/" class="nav-brand">
				<h1>Meeting Room Reservations</h1>
			</a>
			<div class="nav-links">
				<a href="/" class="nav-link">Calendar</a>
				<a href="/admin" class="nav-link">Admin</a>
			</div>
		</div>
	</div>
</nav>

<main class="main-content">
	{@render children?.()}
</main>

<footer class="main-footer">
	<div class="container">
		<p class="text-sm text-secondary">
			© {new Date().getFullYear()} Meeting Room Reservation System
		</p>
	</div>
</footer>

<style>
	.main-nav {
		background-color: var(--color-bg-primary);
		border-bottom: var(--border-width) solid var(--border-color);
		padding: var(--spacing-md) 0;
		position: sticky;
		top: 0;
		z-index: 100;
	}
	
	.nav-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	
	.nav-brand {
		text-decoration: none;
		color: var(--color-text-primary);
	}
	
	.nav-brand h1 {
		margin: 0;
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-bold);
		color: var(--color-primary);
	}
	
	.nav-links {
		display: flex;
		gap: var(--spacing-lg);
	}
	
	.nav-link {
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
		text-decoration: none;
		padding: var(--spacing-sm) var(--spacing-md);
		border-radius: var(--border-radius-sm);
		transition: background-color var(--transition-fast);
	}
	
	.nav-link:hover {
		background-color: var(--color-gray-100);
		text-decoration: none;
	}
	
	.main-content {
		min-height: calc(100vh - 120px);
		padding: var(--spacing-2xl) 0;
	}
	
	.main-footer {
		background-color: var(--color-bg-primary);
		border-top: var(--border-width) solid var(--border-color);
		padding: var(--spacing-lg) 0;
		text-align: center;
	}
	
	.text-sm {
		font-size: var(--font-size-sm);
	}
	
	.text-secondary {
		color: var(--color-text-secondary);
	}
	
	@media (max-width: 768px) {
		.nav-brand h1 {
			font-size: var(--font-size-lg);
		}
		
		.nav-links {
			gap: var(--spacing-sm);
		}
		
		.nav-link {
			padding: var(--spacing-xs) var(--spacing-sm);
			font-size: var(--font-size-sm);
		}
	}
</style>
