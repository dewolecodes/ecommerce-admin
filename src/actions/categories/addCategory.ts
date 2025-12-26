"use server";

/**
 * Deprecated: category add action migrated to server-action.
 * Use `src/actions/categories/addCategory.server.ts`.
 */
export async function addCategory(..._args: any) {
  throw new Error(
    "Deprecated: use src/actions/categories/addCategory.server.ts (Supabase + Cloudinary)."
  );
}
