// Admin login server-side logic

import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { verifyAdminPassword, createAdminSession } from '$lib/server/auth';

export const load: PageServerLoad = async ({ cookies }) => {
	// If already logged in, redirect to admin dashboard
	const sessionCookie = cookies.get('admin_session');
	
	if (sessionCookie) {
		try {
			const session = JSON.parse(sessionCookie);
			if (session.isAuthenticated && Date.now() < session.expiresAt) {
				throw redirect(303, '/admin');
			}
		} catch {
			// Invalid session, continue to login
		}
	}
	
	return {};
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const password = formData.get('password') as string;
		
		if (!password) {
			return fail(400, { error: 'Password is required' });
		}
		
		if (!verifyAdminPassword(password)) {
			return fail(401, { error: 'Invalid password' });
		}
		
		// Create session
		const session = createAdminSession();
		
		// Set cookie
		cookies.set('admin_session', JSON.stringify(session), {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 8 * 60 * 60 // 8 hours
		});
		
		throw redirect(303, '/admin');
	}
};
