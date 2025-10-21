// Server-side data loading for the main calendar page

import type { PageServerLoad } from './$types';
import { getAllReservations } from '$lib/server/sheets';
import { ROOMS, WORKING_HOURS } from '$lib/constants';
import { formatDate, getWeekStart, getWeekDates, generateTimeSlots } from '$lib/utils';

export const load: PageServerLoad = async ({ url }) => {
	try {
		// Get week from URL parameter or default to current week
		const weekParam = url.searchParams.get('week');
		const weekStart = weekParam ? new Date(weekParam) : getWeekStart();
		
		// Get all reservations
		const reservations = await getAllReservations();
		
		// Generate week dates
		const weekDates = getWeekDates(weekStart);
		const formattedDates = weekDates.map(formatDate);
		
		// Generate time slots
		const timeSlots = generateTimeSlots(
			WORKING_HOURS.START_HOUR,
			WORKING_HOURS.END_HOUR,
			WORKING_HOURS.INTERVAL_MINUTES
		);
		
		return {
			rooms: ROOMS,
			reservations,
			weekStart: formatDate(weekStart),
			dates: formattedDates,
			timeSlots
		};
	} catch (error) {
		console.error('Error loading calendar data:', error);
		return {
			rooms: ROOMS,
			reservations: [],
			weekStart: formatDate(getWeekStart()),
			dates: getWeekDates(getWeekStart()).map(formatDate),
			timeSlots: generateTimeSlots(
				WORKING_HOURS.START_HOUR,
				WORKING_HOURS.END_HOUR,
				WORKING_HOURS.INTERVAL_MINUTES
			),
			error: 'Failed to load reservations. Please try again later.'
		};
	}
};
