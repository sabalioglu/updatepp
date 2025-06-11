import { nanoid } from 'nanoid';

/**
 * Generate a unique ID using nanoid
 * This works across both web and native platforms
 */
export const generateUniqueId = () => nanoid();