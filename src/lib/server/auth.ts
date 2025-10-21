// Admin authentication helpers

import { env } from '$env/dynamic/private';

const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours

export interface AdminSession {
	isAuthenticated: boolean;
	expiresAt: number;
}

/**
 * Verify admin password
 */
export function verifyAdminPassword(password: string): boolean {
	return password === env.ADMIN_PASSWORD;
}

/**
 * Create admin session
 */
export function createAdminSession(): AdminSession {
	return {
		isAuthenticated: true,
		expiresAt: Date.now() + SESSION_DURATION
	};
}

/**
 * Check if session is valid
 */
export function isSessionValid(session: AdminSession | null): boolean {
	if (!session || !session.isAuthenticated) {
		return false;
	}
	
	return Date.now() < session.expiresAt;
}
