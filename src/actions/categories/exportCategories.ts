"use server";

/**
 * Deprecated: export action migrated to server-action.
 */
export async function exportCategories(..._args: any) {
  throw new Error(
    "Deprecated: use src/actions/categories/exportCategories.server.ts (Supabase)."
  );
}
