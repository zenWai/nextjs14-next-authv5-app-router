/**
 * Auth.js API Route Handler
 *
 * @notice
 * This file serves as the API endpoint that Auth.js needs to operate.
 *
 * @path /api/auth/[...nextauth]
 * This catches all routes under /api/auth/ and forwards them to Auth.js
 */
export { GET, POST } from '@/auth';
