"use server";

/**
 * Deprecated: category delete single action migrated to server-action.
 */
export async function deleteCategory(..._args: any) {
  throw new Error(
    "Deprecated: use src/actions/categories/deleteCategory.server.ts (Supabase)."
  );
}
