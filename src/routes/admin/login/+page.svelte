<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	
	let { form }: { form: ActionData } = $props();
</script>

<div class="login-container">
	<div class="login-card card">
		<div class="login-header">
			<h1>Admin Login</h1>
			<p class="text-secondary">Enter password to access admin dashboard</p>
		</div>
		
		{#if form?.error}
			<div class="alert alert-error">
				{form.error}
			</div>
		{/if}
		
		<form method="POST" use:enhance>
			<div class="form-group">
				<label for="password">Password</label>
				<input
					type="password"
					id="password"
					name="password"
					placeholder="Enter admin password"
					required
					autofocus
				/>
			</div>
			
			<button type="submit" class="btn btn-primary btn-lg" style="width: 100%;">
				Login
			</button>
		</form>
		
		<div class="login-footer">
			<a href="/" class="text-sm">← Back to Calendar</a>
		</div>
	</div>
</div>

<style>
	.login-container {
		min-height: 80vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-lg);
	}
	
	.login-card {
		width: 100%;
		max-width: 400px;
	}
	
	.login-header {
		text-align: center;
		margin-bottom: var(--spacing-xl);
	}
	
	.login-header h1 {
		margin-bottom: var(--spacing-sm);
	}
	
	.text-secondary {
		color: var(--color-text-secondary);
	}
	
	.text-sm {
		font-size: var(--font-size-sm);
	}
	
	.login-footer {
		margin-top: var(--spacing-lg);
		text-align: center;
	}
</style>
