export type AppRole = "ADMIN" | "MEMBER";

export const isAdminRole = (role?: string | null) => role === "ADMIN";
