// Application constants

import type { Room } from './types';

/**
 * The 4 meeting rooms available for reservation
 */
export const ROOMS: Room[] = [
	{
		id: 'room-1',
		name: 'Meeting Room 1',
		description: 'Main conference room'
	},
	{
		id: 'room-2',
		name: 'Meeting Room 2',
		description: 'Small meeting room'
	},
	{
		id: 'room-3',
		name: 'Meeting Room 3',
		description: 'Team collaboration space'
	},
	{
		id: 'room-4',
		name: 'Meeting Room 4',
		description: 'Executive meeting room'
	}
];

/**
 * Working hours configuration
 */
export const WORKING_HOURS = {
	START_HOUR: 8,
	END_HOUR: 20,
	INTERVAL_MINUTES: 30
} as const;

/**
 * Company names (for dropdown)
 */
export const COMPANIES = ['Company A', 'Company B'] as const;

/**
 * Maximum reservation duration in hours
 */
export const MAX_RESERVATION_HOURS = 8;

/**
 * Minimum reservation duration in minutes
 */
export const MIN_RESERVATION_MINUTES = 15;

/**
 * Maximum days in advance for reservations
 */
export const MAX_ADVANCE_DAYS = 365;
