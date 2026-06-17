/**
 * On-demand Revalidation Route
 * Route: /api/revalidate
 *
 * Called server-side after any admin create, update, or delete action.
 * Triggers Next.js ISR revalidation for the affected public pages so
 * content appears immediately without a full Vercel redeploy.
 *
 * This route is internal — it is only ever called from our own
 * server actions / API routes, never from the browser directly.
 * It is protected by a shared secret set in environment variables.
 *
 * @module app/api/revalidate/route
 */

import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Verify the request is coming from our own admin forms
  const secret = request.headers.get("x-revalidate-secret");
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { paths } = await request.json() as { paths: string[] };

  if (!Array.isArray(paths) || paths.length === 0) {
    return NextResponse.json({ error: "No paths provided" }, { status: 400 });
  }

  const revalidated: string[] = [];

  for (const path of paths) {
    revalidatePath(path);
    revalidated.push(path);
  }

  return NextResponse.json({ revalidated, now: Date.now() });
}
