/**
 * Role-Based Access Control (RBAC) for SOUQai Team System
 * 
 * Roles hierarchy: owner > manager > editor > viewer
 * 
 * Permission matrix:
 * - owner:   Full access (settings, billing, team, delete, create, edit, view)
 * - manager: Manage orders, inventory, customers, apps, analytics (no billing/team settings)
 * - editor:  Create/edit products, manage orders (no settings, no apps, no team)
 * - viewer:  Read-only access to orders, inventory, analytics, customers
 */

export type Role = 'owner' | 'manager' | 'editor' | 'viewer';

export type Permission =
    | 'view_dashboard'
    | 'view_orders'
    | 'manage_orders'        // update status, send shipping
    | 'view_inventory'
    | 'manage_inventory'     // add, edit, delete products
    | 'view_customers'
    | 'view_analytics'
    | 'view_abandoned_carts' // view and manage abandoned carts
    | 'manage_settings'      // store settings, billing
    | 'manage_team'          // invite, remove, change roles
    | 'manage_apps'          // pixel integrations
    | 'manage_templates'     // builder / AI landing
    | 'ban_customers';       // block customers

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    owner: [
        'view_dashboard', 'view_orders', 'manage_orders',
        'view_inventory', 'manage_inventory',
        'view_customers', 'view_analytics', 'view_abandoned_carts',
        'manage_settings', 'manage_team', 'manage_apps',
        'manage_templates', 'ban_customers',
    ],
    manager: [
        'view_dashboard', 'view_orders', 'manage_orders',
        'view_inventory', 'manage_inventory',
        'view_customers', 'view_abandoned_carts',
        'manage_apps', 'manage_templates',
    ],
    editor: [
        'view_dashboard', 'view_orders', 'manage_orders',
        'view_inventory', 'manage_inventory',
        'view_customers', 'view_abandoned_carts',
    ],
    viewer: [
        'view_dashboard', 'view_orders',
        'view_inventory', 'view_customers',
        'view_abandoned_carts',
    ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: string | undefined, permission: Permission): boolean {
    const normalizedRole = (role || 'viewer') as Role;
    return ROLE_PERMISSIONS[normalizedRole]?.includes(permission) ?? false;
}

/**
 * Check if a role can access a specific nav item
 */
export function canAccessNavItem(role: string | undefined, navId: string): boolean {
    const permissionMap: Record<string, Permission> = {
        'Dashboard': 'view_dashboard',
        'Orders': 'view_orders',
        'Inventory': 'view_inventory',
        'Customers': 'view_customers',
        'Analytics': 'view_analytics',
        'AbandonedCarts': 'view_abandoned_carts',
        'Templates': 'manage_templates',
        'AILanding': 'manage_templates',
        'Team': 'manage_team',
        'Apps': 'manage_apps',
        'Settings': 'manage_settings',
    };

    const requiredPermission = permissionMap[navId];
    if (!requiredPermission) return true; // Unknown items are accessible
    return hasPermission(role, requiredPermission);
}

/**
 * Get the display name for a role in Arabic
 */
export function getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
        owner: 'مالك المتجر',
        manager: 'مدير',
        editor: 'محرر',
        viewer: 'مشاهد',
    };
    return labels[role] || role;
}
