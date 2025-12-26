"use server";

/**
 * Deprecated: multiple edit action migrated to server-action.
 */
export async function editCategories(..._args: any) {
  throw new Error(
    "Deprecated: use src/actions/categories/editCategories.server.ts (Supabase)."
  );
}
