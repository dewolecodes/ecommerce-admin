"use server";

/**
 * Deprecated: category edit action migrated to server-action.
 * Use `src/actions/categories/editCategory.server.ts`.
 */
export async function editCategory(..._args: any) {
  throw new Error(
    "Deprecated: use src/actions/categories/editCategory.server.ts (Supabase + Cloudinary)."
  );
}
