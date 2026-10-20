/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  SOUQ AI - Super Admin Security Configuration                ║
 * ║  This file contains the ONLY authorized admin email.         ║
 * ║  Any attempt to access /super-admin is verified against      ║
 * ║  this list at BOTH middleware and component levels.           ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

// ─── Authorized Super Admin Emails ────────────────────────────
// CRITICAL: Only emails listed here can access the super-admin dashboard.
// This is a hardcoded whitelist — NOT stored in the database — to prevent
// any database-level manipulation from granting unauthorized access.
export const SUPER_ADMIN_EMAILS: string[] = [
    'zakariaroui7@gmail.com',
];

// ─── Helper: Check if email is an authorized admin ────────────
export function isSuperAdminEmail(email: string | null | undefined): boolean {
    if (!email) return false;
    return SUPER_ADMIN_EMAILS.includes(email.toLowerCase().trim());
}
