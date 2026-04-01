export const ROLE_PERMISSIONS = {
  viewer: ["dashboard.read"],
  analyst: ["dashboard.read", "records.read"],
  admin: [
    "dashboard.read",
    "records.read",
    "records.write",
    "users.manage",
    "roles.manage"
  ]
} as const;

export type Permission = (typeof ROLE_PERMISSIONS)[keyof typeof ROLE_PERMISSIONS][number];
