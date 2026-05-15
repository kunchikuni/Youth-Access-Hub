"use client";
/**
 * ContactForm Component
 * Client-side contact form with validation and submission to /api/contact.
 * @module components/forms/ContactForm
 */
import { useState } from "react";
import Button from "@/components/ui/Button";

type FormState = "idle" | "submitting" | "success" | "error";
type Intent = "general" | "mentor" | "partner" | "program" | "opportunity";

const INTENT_OPTIONS: { value: Intent; label: string }[] = [
  { value: "general", label: "General enquiry" },
  { value: "mentor", label: "I want to become a mentor" },
  { value: "partner", label: "I want to partner with YAH" },
  { value: "program", label: "I want to join a program" },
  { value: "opportunity", label: "I want to access an opportunity" },
];

export default function ContactForm({ defaultIntent = "general" }: { defaultIntent?: Intent }) {
  const [state, setState] = useState<FormState>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ name: "", email: "", phone: "", intent: defaultIntent, message: "" });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email.trim()) e.email = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Please enter a valid email";
    if (!form.message.trim()) e.message = "Message is required";
    else if (form.message.trim().length < 10) e.message = "Message must be at least 10 characters";
    return e;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((prev) => { const n = { ...prev }; delete n[e.target.name]; return n; });
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length > 0) { setErrors(v); return; }
    setState("submitting");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error("Submission failed");
      setState("success");
    } catch {
      setState("error");
    }
  };

  if (state === "success") {
    return (
      <div className="p-8 rounded-2xl text-center flex flex-col items-center gap-4"
        style={{ backgroundColor: "rgba(43,174,142,0.08)", border: "2px solid rgba(43,174,142,0.25)" }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "rgba(43,174,142,0.15)", color: "var(--yah-teal)" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h3 className="font-bold text-xl" style={{ fontFamily: "var(--font-heading)", color: "var(--yah-navy)" }}>Message Sent!</h3>
        <p className="text-sm" style={{ color: "var(--yah-slate)" }}>Thank you for reaching out. A YAH coordinator will be in touch within 2 business days.</p>
        <button onClick={() => { setState("idle"); setForm({ name: "", email: "", phone: "", intent: defaultIntent, message: "" }); }}
          className="text-sm font-semibold hover:underline underline-offset-4" style={{ color: "var(--yah-teal)", fontFamily: "var(--font-heading)" }}>
          Send another message
        </button>
      </div>
    );
  }

  const fieldStyle: React.CSSProperties = { width: "100%", padding: "12px 16px", borderRadius: "var(--radius-md)", border: "1.5px solid var(--yah-light-gray)", fontFamily: "var(--font-body)", fontSize: "14px", color: "var(--yah-slate)", backgroundColor: "var(--yah-white)", outline: "none", transition: "border-color 200ms" };
  const errorStyle: React.CSSProperties = { fontSize: "12px", color: "#B91C1C", marginTop: "4px", fontFamily: "var(--font-body)" };

  return (
    <div className="flex flex-col gap-5">
      {state === "error" && (
        <div className="p-4 rounded-xl text-sm" style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#B91C1C" }}>
          Something went wrong. Please try again or email us directly at info@youthaccesshub.org
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold mb-1.5" style={{ color: "var(--yah-navy)", fontFamily: "var(--font-heading)" }}>Full Name *</label>
          <input id="name" name="name" type="text" value={form.name} onChange={handleChange} placeholder="Your full name"
            style={{ ...fieldStyle, borderColor: errors.name ? "#EF4444" : "var(--yah-light-gray)" }} aria-describedby={errors.name ? "name-error" : undefined} />
          {errors.name && <p id="name-error" style={errorStyle}>{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-semibold mb-1.5" style={{ color: "var(--yah-navy)", fontFamily: "var(--font-heading)" }}>Email Address *</label>
          <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com"
            style={{ ...fieldStyle, borderColor: errors.email ? "#EF4444" : "var(--yah-light-gray)" }} aria-describedby={errors.email ? "email-error" : undefined} />
          {errors.email && <p id="email-error" style={errorStyle}>{errors.email}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="phone" className="block text-sm font-semibold mb-1.5" style={{ color: "var(--yah-navy)", fontFamily: "var(--font-heading)" }}>Phone Number <span style={{ color: "var(--yah-slate)", fontWeight: 400 }}>(optional)</span></label>
          <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+263 77 000 0000" style={fieldStyle} />
        </div>
        <div>
          <label htmlFor="intent" className="block text-sm font-semibold mb-1.5" style={{ color: "var(--yah-navy)", fontFamily: "var(--font-heading)" }}>I am reaching out because…</label>
          <select id="intent" name="intent" value={form.intent} onChange={handleChange} style={fieldStyle}>
            {INTENT_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-semibold mb-1.5" style={{ color: "var(--yah-navy)", fontFamily: "var(--font-heading)" }}>Message *</label>
        <textarea id="message" name="message" rows={5} value={form.message} onChange={handleChange} placeholder="Tell us a bit about yourself and how we can help…"
          style={{ ...fieldStyle, resize: "vertical", borderColor: errors.message ? "#EF4444" : "var(--yah-light-gray)" }} aria-describedby={errors.message ? "message-error" : undefined} />
        {errors.message && <p id="message-error" style={errorStyle}>{errors.message}</p>}
      </div>

      <Button variant="primary" size="lg" loading={state === "submitting"} onClick={handleSubmit} aria-label="Send message">
        {state === "submitting" ? "Sending…" : "Send Message"}
      </Button>

      <p className="text-xs" style={{ color: "var(--yah-slate)" }}>
        By submitting this form you agree to our{" "}
        <a href="/privacy" className="hover:underline underline-offset-4" style={{ color: "var(--yah-teal)" }}>Privacy Policy</a>.
        We will only use your information to respond to your enquiry.
      </p>
    </div>
  );
}
