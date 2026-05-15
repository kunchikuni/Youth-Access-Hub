/**
 * Contact Form API Route — POST /api/contact
 *
 * Validates and processes contact form submissions.
 * Phase 1: Logs to console (no email delivery yet).
 * Phase 2: Integrate Resend API for actual email delivery.
 *
 * Security: input validation, no raw data forwarded without sanitisation.
 *
 * @module app/api/contact/route
 */
import { NextRequest, NextResponse } from "next/server";

interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  intent: string;
  message: string;
}

const ALLOWED_INTENTS = ["general", "mentor", "partner", "program", "opportunity"];

function sanitise(str: string): string {
  return str.trim().replace(/<[^>]*>/g, "");
}

function validatePayload(body: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (typeof body !== "object" || body === null) return { valid: false, errors: ["Invalid request body"] };
  const b = body as Record<string, unknown>;
  if (!b.name || typeof b.name !== "string" || b.name.trim().length < 2) errors.push("Name must be at least 2 characters");
  if (!b.email || typeof b.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email)) errors.push("Valid email address is required");
  if (!b.message || typeof b.message !== "string" || b.message.trim().length < 10) errors.push("Message must be at least 10 characters");
  if (b.intent && !ALLOWED_INTENTS.includes(b.intent as string)) errors.push("Invalid intent value");
  return { valid: errors.length === 0, errors };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { valid, errors } = validatePayload(body);
    if (!valid) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    const payload = body as ContactPayload;
    const sanitised: ContactPayload = {
      name: sanitise(payload.name),
      email: sanitise(payload.email),
      phone: payload.phone ? sanitise(payload.phone) : undefined,
      intent: sanitise(payload.intent ?? "general"),
      message: sanitise(payload.message),
    };

    // ── Phase 1: Log to console ────────────────────────────────────────────
    // TODO Phase 2: Replace with Resend email delivery
    // import { Resend } from "resend";
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({ from: "...", to: process.env.CONTACT_EMAIL_TO, ... });
    console.log("[YAH Contact Form]", {
      timestamp: new Date().toISOString(),
      ...sanitised,
    });

    return NextResponse.json({ success: true, message: "Message received. We will be in touch within 2 business days." }, { status: 200 });
  } catch (error) {
    console.error("[YAH Contact Form] Error:", error);
    return NextResponse.json({ success: false, errors: ["Internal server error. Please try again."] }, { status: 500 });
  }
}

// Only POST is allowed on this route
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
