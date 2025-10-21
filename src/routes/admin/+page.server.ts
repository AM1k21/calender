// Admin dashboard server-side logic

import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { getAllReservations, deleteReservation, updateReservation } from '$lib/server/sheets';
import { isSessionValid } from '$lib/server/auth';
import { ROOMS } from '$lib/constants';

export const load: PageServerLoad = async ({ cookies }) => {
	// Check authentication
	const sessionCookie = cookies.get('admin_session');
	
	if (!sessionCookie) {
		throw redirect(303, '/admin/login');
	}
	
	try {
		const session = JSON.parse(sessionCookie);
		
		if (!isSessionValid(session)) {
			cookies.delete('admin_session', { path: '/' });
			throw redirect(303, '/admin/login');
		}
	} catch {
		throw redirect(303, '/admin/login');
	}
	
	// Load reservations
	try {
		const reservations = await getAllReservations();
		
		return {
			reservations,
			rooms: ROOMS
		};
	} catch (error) {
		console.error('Error loading reservations:', error);
		return {
			reservations: [],
			rooms: ROOMS,
			error: 'Failed to load reservations'
		};
	}
};

export const actions: Actions = {
	delete: async ({ request, cookies }) => {
		// Check authentication
		const sessionCookie = cookies.get('admin_session');
		
		if (!sessionCookie) {
			return fail(401, { error: 'Unauthorized' });
		}
		
		try {
			const session = JSON.parse(sessionCookie);
			
			if (!isSessionValid(session)) {
				cookies.delete('admin_session', { path: '/' });
				return fail(401, { error: 'Session expired' });
			}
		} catch {
			return fail(401, { error: 'Invalid session' });
		}
		
		const formData = await request.formData();
		const reservationId = formData.get('id') as string;
		
		if (!reservationId) {
			return fail(400, { error: 'Missing reservation ID' });
		}
		
		try {
			await deleteReservation(reservationId);
			return { success: true };
		} catch (error) {
			console.error('Error deleting reservation:', error);
			return fail(500, { error: 'Failed to delete reservation' });
		}
	},
	
	logout: async ({ cookies }) => {
		cookies.delete('admin_session', { path: '/' });
		throw redirect(303, '/admin/login');
	}
};
