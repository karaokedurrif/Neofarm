/* ── Multi-Tenant Configuration ──────────────────────────────────
 *  Defines farms (tenants), user↔farm associations, and helpers.
 *  In the future this will live in a DB; for now hardcoded demo.
 * ──────────────────────────────────────────────────────────────── */

export interface Farm {
  id: string;           // UUID-like internal id
  slug: string;         // URL slug: /farm/palacio
  name: string;         // Display name
  description?: string;
  location?: string;
  avatar: string;       // Emoji avatar
  plan: 'free' | 'pro' | 'enterprise';
  createdAt: string;    // ISO date
  isDemo?: boolean;     // Demo farm (read-only showcase)
}

export interface FarmMembership {
  farmId: string;
  userId: number;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
}

/* ── Farms ─────────────────────────────────────────── */
export const FARMS: Farm[] = [
  {
    id: 'farm-capones',
    slug: 'capones',
    name: 'Granja Los Capones',
    description: 'Granja demo de OvoSfera con datos de ejemplo completos.',
    location: 'Asturias, España',
    avatar: '🐓',
    plan: 'pro',
    createdAt: '2024-01-01',
    isDemo: true,
  },
  {
    id: 'farm-palacio',
    slug: 'palacio',
    name: 'El Gallinero del Palacio',
    description: 'Granja nueva — empieza a registrar tus aves, gallineros y producción.',
    location: 'España',
    avatar: '🏰',
    plan: 'pro',
    createdAt: '2026-03-09',
    isDemo: false,
  },
];

/* ── User ↔ Farm memberships ──────────────────────── */
export const MEMBERSHIPS: FarmMembership[] = [
  // Granja Los Capones — todos tienen acceso (demo)
  { farmId: 'farm-capones', userId: 1, role: 'admin' },
  { farmId: 'farm-capones', userId: 2, role: 'admin' },
  { farmId: 'farm-capones', userId: 3, role: 'admin' },
  // El Gallinero del Palacio — los 3 son admin
  { farmId: 'farm-palacio', userId: 1, role: 'admin' },
  { farmId: 'farm-palacio', userId: 2, role: 'admin' },
  { farmId: 'farm-palacio', userId: 3, role: 'admin' },
];

/* ── Helpers ───────────────────────────────────────── */

/** Get all farms a user has access to */
export function getUserFarms(userId: number): (Farm & { role: FarmMembership['role'] })[] {
  return MEMBERSHIPS
    .filter(m => m.userId === userId)
    .map(m => {
      const farm = FARMS.find(f => f.id === m.farmId);
      if (!farm) return null;
      return { ...farm, role: m.role };
    })
    .filter(Boolean) as (Farm & { role: FarmMembership['role'] })[];
}

/** Get a farm by slug */
export function getFarmBySlug(slug: string): Farm | undefined {
  return FARMS.find(f => f.slug === slug);
}

/** Check if a user has access to a farm */
export function userHasAccess(userId: number, farmSlug: string): FarmMembership | undefined {
  const farm = getFarmBySlug(farmSlug);
  if (!farm) return undefined;
  return MEMBERSHIPS.find(m => m.farmId === farm.id && m.userId === userId);
}

/** Check if user has at least the given role on a farm */
export function userHasRole(userId: number, farmSlug: string, minRole: 'viewer' | 'editor' | 'admin' | 'owner'): boolean {
  const membership = userHasAccess(userId, farmSlug);
  if (!membership) return false;
  const hierarchy = ['viewer', 'editor', 'admin', 'owner'];
  return hierarchy.indexOf(membership.role) >= hierarchy.indexOf(minRole);
}
