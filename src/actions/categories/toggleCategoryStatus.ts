"use server";

/**
 * Deprecated: toggle status action migrated to server-action.
 */
export async function toggleCategoryStatus(..._args: any) {
  throw new Error(
    "Deprecated: use src/actions/categories/toggleCategoryStatus.server.ts (Supabase)."
  );
}
