import "server-only";

import { unstable_rethrow } from "next/navigation";

/**
 * Runs a data load and returns `null` on failure so a section can render a
 * fallback. Next.js control-flow errors (notFound, redirect, dynamic bailout)
 * are re-thrown untouched. JSX stays outside the try/catch on purpose.
 */
export async function tryLoad<T>(load: () => Promise<T>): Promise<T | null> {
  try {
    return await load();
  } catch (error) {
    unstable_rethrow(error);
    return null;
  }
}
