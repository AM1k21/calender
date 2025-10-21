// API endpoint for creating reservations

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createReservation, getAllReservations } from '$lib/server/sheets';
import { validateReservationDate, validateReservationTimes, isTimeSlotAvailable } from '$lib/utils';
import type { ReservationFormData, ApiResponse } from '$lib/types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data: ReservationFormData = await request.json();
		
		// Validate required fields
		if (!data.roomId || !data.roomName || !data.date || !data.startTime || !data.endTime || !data.reservedBy || !data.company) {
			return json<ApiResponse>({
				success: false,
				error: 'Missing required fields'
			}, { status: 400 });
		}
		
		// Validate date
		const dateValidation = validateReservationDate(data.date);
		if (!dateValidation.valid) {
			return json<ApiResponse>({
				success: false,
				error: dateValidation.error
			}, { status: 400 });
		}
		
		// Validate times
		const timeValidation = validateReservationTimes(data.startTime, data.endTime);
		if (!timeValidation.valid) {
			return json<ApiResponse>({
				success: false,
				error: timeValidation.error
			}, { status: 400 });
		}
		
		// Check for conflicts
		const existingReservations = await getAllReservations();
		const isAvailable = isTimeSlotAvailable(
			data.roomId,
			data.date,
			data.startTime,
			data.endTime,
			existingReservations
		);
		
		if (!isAvailable) {
			return json<ApiResponse>({
				success: false,
				error: 'This time slot is already reserved. Please select a different time.'
			}, { status: 409 });
		}
		
		// Create the reservation
		const reservation = await createReservation({
			roomId: data.roomId,
			roomName: data.roomName,
			date: data.date,
			startTime: data.startTime,
			endTime: data.endTime,
			reservedBy: data.reservedBy.trim(),
			company: data.company
		});
		
		return json<ApiResponse>({
			success: true,
			data: reservation,
			message: 'Reservation created successfully'
		}, { status: 201 });
	} catch (error) {
		console.error('Error creating reservation:', error);
		return json<ApiResponse>({
			success: false,
			error: 'Failed to create reservation. Please try again.'
		}, { status: 500 });
	}
};

export const GET: RequestHandler = async () => {
	try {
		const reservations = await getAllReservations();
		
		return json<ApiResponse>({
			success: true,
			data: reservations
		});
	} catch (error) {
		console.error('Error fetching reservations:', error);
		return json<ApiResponse>({
			success: false,
			error: 'Failed to fetch reservations'
		}, { status: 500 });
	}
};
