import { nanoid } from 'nanoid/non-secure';

/**
 * Generate a unique ID using nanoid (non-secure version)
 * This works across both web and native platforms without requiring crypto.getRandomValues()
 */
export const generateUniqueId = () => nanoid();