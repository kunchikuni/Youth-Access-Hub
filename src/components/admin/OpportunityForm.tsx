"use client";

/**
 * OpportunityForm
 *
 * Shared form used by both:
 *  - /admin/opportunities/new    (create mode)
 *  - /admin/opportunities/[slug] (edit mode — prefilled)
 *
 * Image upload strategy (Option A):
 *  - Client uploads the image to Supabase Storage directly from the browser
 *  - Gets back the public URL
 *  - Passes that URL to the server action along with all other fields
 *  - Server action only touches the DB — never handles the file
 *
 * All DB writes go through server actions in src/actions/opportunities.ts.
 * No Supabase client DB calls are made from this component.
 *
 * @module components/admin/OpportunityForm
 */

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createOpportunity, updateOpportunity } from "@/actions/opportunities";
import type { Opportunity, OpportunityCategory, OpportunityStatus } from "@/types/opportunity";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(str: string): string {
  return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
}

const CATEGORIES: OpportunityCategory[] = [
  "internship", "employment", "funding", "training", "volunteering", "scholarship",
];

const STATUSES: { value: OpportunityStatus; label: string }[] = [
  { value: "open",        label: "Open" },
  { value: "closed",      label: "Closed" },
  { value: "coming-soon", label: "Coming soon" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldLabel({ htmlFor, children, required }: {
  htmlFor: string; children: React.ReactNode; required?: boolean;
}) {
  return (
      <label htmlFor={htmlFor} className="of-label">
        {children}
        {required && <span className="of-required" aria-hidden="true"> *</span>}
      </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <span className="of-field-error" role="alert">{message}</span>;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="of-section-heading">{children}</h3>;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface OpportunityFormProps {
  opportunity?: Opportunity;
}

type FormErrors = Partial<Record<string, string>>;

// ─── Component ────────────────────────────────────────────────────────────────

export default function OpportunityForm({ opportunity }: OpportunityFormProps) {
  const router = useRouter();
  const isEdit = !!opportunity;

  const [title,       setTitle]       = useState(opportunity?.title       ?? "");
  const [slug,        setSlug]        = useState(opportunity?.slug        ?? "");
  const [tagline,     setTagline]     = useState(opportunity?.tagline     ?? "");
  const [description, setDescription] = useState(opportunity?.description ?? "");
  const [category,    setCategory]    = useState<OpportunityCategory>(opportunity?.category ?? "internship");
  const [status,      setStatus]      = useState<OpportunityStatus>(opportunity?.status     ?? "coming-soon");
  const [provider,    setProvider]    = useState(opportunity?.provider    ?? "");
  const [location,    setLocation]    = useState(opportunity?.location    ?? "");
  const [audience,    setAudience]    = useState(opportunity?.audience    ?? "");
  const [howToApply,  setHowToApply]  = useState(opportunity?.howToApply  ?? "");
  const [deadline,    setDeadline]    = useState(opportunity?.deadline?.slice(0, 10) ?? "");
  const [applyUrl,    setApplyUrl]    = useState(opportunity?.applyUrl    ?? "");
  const [featured,    setFeatured]    = useState(opportunity?.featured    ?? false);

  const [eligibility, setEligibility] = useState<string[]>(
      opportunity?.eligibility?.length ? opportunity.eligibility : [""]
  );

  const [imageFile,      setImageFile]      = useState<File | null>(null);
  const [imagePreview,   setImagePreview]   = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [errors,      setErrors]      = useState<FormErrors>({});
  const [saving,      setSaving]      = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!isEdit) setSlug(slugify(value));
  }

  const updateEligibility = (i: number, v: string) =>
      setEligibility((p) => p.map((e, idx) => (idx === i ? v : e)));
  const addEligibility    = () => setEligibility((p) => [...p, ""]);
  const removeEligibility = (i: number) =>
      setEligibility((p) => p.filter((_, idx) => idx !== i));

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function clearImage() {
    setImageFile(null);
    setImagePreview(null);
  }

  const uploadImage = useCallback(async (file: File, slug: string): Promise<string | null> => {
    setUploadingImage(true);
    const supabase = createClient();
    const ext  = file.name.split(".").pop();
    const path = `opportunities/${slug}-${Date.now()}.${ext}`;

    const { error } = await supabase.storage
        .from("yah-media")
        .upload(path, file, { upsert: true });

    setUploadingImage(false);

    if (error) {
      setGlobalError(`Image upload failed: ${error.message}`);
      return null;
    }

    const { data } = supabase.storage.from("yah-media").getPublicUrl(path);
    return data.publicUrl;
  }, []);

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!title.trim())       e.title       = "Title is required.";
    if (!slug.trim())        e.slug        = "Slug is required.";
    if (!tagline.trim())     e.tagline     = "Tagline is required.";
    if (!description.trim()) e.description = "Description is required.";
    if (!provider.trim())    e.provider    = "Provider is required.";
    if (!location.trim())    e.location    = "Location is required.";
    if (!audience.trim())    e.audience    = "Audience is required.";
    if (!howToApply.trim())  e.howToApply  = "How to apply is required.";

    if (!eligibility.filter((e) => e.trim()).length)
      e.eligibility = "At least one eligibility requirement is required.";

    if (applyUrl && !/^https?:\/\/.+/.test(applyUrl))
      e.applyUrl = "Apply URL must start with http:// or https://";

    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGlobalError(null);

    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      document
          .querySelector("[data-error]")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setErrors({});
    setSaving(true);

    let coverImageUrl: string | null = imagePreview ?? null;
    if (imageFile) {
      coverImageUrl = await uploadImage(imageFile, slug);
      if (!coverImageUrl) {
        setSaving(false);
        return;
      }
    }

    const payload = {
      slug:         slug.trim(),
      title:        title.trim(),
      tagline:      tagline.trim(),
      description:  description.trim(),
      category,
      status,
      provider:     provider.trim(),
      location:     location.trim(),
      audience:     audience.trim(),
      eligibility:  eligibility.filter((e) => e.trim()),
      howToApply:   howToApply.trim(),
      featured,
      coverImageUrl,
      ...(deadline        && { deadline }),
      ...(applyUrl.trim() && { applyUrl: applyUrl.trim() }),
    };

    const result = isEdit
        ? await updateOpportunity(opportunity!.slug, payload)
        : await createOpportunity(payload);

    if (!result.success) {
      setGlobalError(result.error ?? "Something went wrong. Please try again.");
      setSaving(false);
      return;
    }

    router.push("/admin/opportunities");
    router.refresh();
  }

  return (
      <form onSubmit={handleSubmit} className="of-form" noValidate>

        {globalError && (
            <div className="of-global-error" role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.75" />
                <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              {globalError}
            </div>
        )}

        <div className="of-card">
          <SectionHeading>Core details</SectionHeading>

          <div className="of-field" data-error={errors.title || undefined}>
            <FieldLabel htmlFor="title" required>Title</FieldLabel>
            <input id="title" type="text" value={title}
                   onChange={(e) => handleTitleChange(e.target.value)}
                   className={`of-input ${errors.title ? "of-input--error" : ""}`}
                   placeholder="e.g. Junior IT Internship – TechZim Partners" />
            <FieldError message={errors.title} />
          </div>

          <div className="of-field" data-error={errors.slug || undefined}>
            <FieldLabel htmlFor="slug" required>Slug</FieldLabel>
            <input id="slug" type="text" value={slug}
                   onChange={(e) => setSlug(slugify(e.target.value))}
                   className={`of-input of-input--mono ${errors.slug ? "of-input--error" : ""}`}
                   placeholder="junior-it-internship-techzim"
                   readOnly={isEdit}
                   aria-describedby="slug-hint" />
            <span id="slug-hint" className="of-hint">
            {isEdit
                ? "Slug cannot be changed after creation."
                : "Auto-generated from title. Used in the URL: /opportunities/[slug]"}
          </span>
            <FieldError message={errors.slug} />
          </div>

          <div className="of-field" data-error={errors.tagline || undefined}>
            <FieldLabel htmlFor="tagline" required>Tagline</FieldLabel>
            <input id="tagline" type="text" value={tagline}
                   onChange={(e) => setTagline(e.target.value)}
                   className={`of-input ${errors.tagline ? "of-input--error" : ""}`}
                   placeholder="One-line summary shown on cards" maxLength={120} />
            <FieldError message={errors.tagline} />
          </div>

          <div className="of-field" data-error={errors.description || undefined}>
            <FieldLabel htmlFor="description" required>Description</FieldLabel>
            <textarea id="description" value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className={`of-textarea ${errors.description ? "of-input--error" : ""}`}
                      placeholder="Full description shown on the opportunity detail page…"
                      rows={5} />
            <FieldError message={errors.description} />
          </div>

          <div className="of-row">
            <div className="of-field">
              <FieldLabel htmlFor="category" required>Category</FieldLabel>
              <select id="category" value={category}
                      onChange={(e) => setCategory(e.target.value as OpportunityCategory)}
                      className="of-select">
                {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="of-field">
              <FieldLabel htmlFor="status" required>Status</FieldLabel>
              <select id="status" value={status}
                      onChange={(e) => setStatus(e.target.value as OpportunityStatus)}
                      className="of-select">
                {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="of-row">
            <div className="of-field" data-error={errors.provider || undefined}>
              <FieldLabel htmlFor="provider" required>Provider</FieldLabel>
              <input id="provider" type="text" value={provider}
                     onChange={(e) => setProvider(e.target.value)}
                     className={`of-input ${errors.provider ? "of-input--error" : ""}`}
                     placeholder="e.g. TechZim Partner Network" />
              <FieldError message={errors.provider} />
            </div>
            <div className="of-field" data-error={errors.location || undefined}>
              <FieldLabel htmlFor="location" required>Location</FieldLabel>
              <input id="location" type="text" value={location}
                     onChange={(e) => setLocation(e.target.value)}
                     className={`of-input ${errors.location ? "of-input--error" : ""}`}
                     placeholder="e.g. Harare, Remote, Nationwide" />
              <FieldError message={errors.location} />
            </div>
          </div>

          <div className="of-field" data-error={errors.audience || undefined}>
            <FieldLabel htmlFor="audience" required>Audience</FieldLabel>
            <input id="audience" type="text" value={audience}
                   onChange={(e) => setAudience(e.target.value)}
                   className={`of-input ${errors.audience ? "of-input--error" : ""}`}
                   placeholder="e.g. IT/Computer Science students and recent graduates" />
            <FieldError message={errors.audience} />
          </div>

          <div className="of-field" data-error={errors.howToApply || undefined}>
            <FieldLabel htmlFor="howToApply" required>How to apply</FieldLabel>
            <textarea id="howToApply" value={howToApply}
                      onChange={(e) => setHowToApply(e.target.value)}
                      className={`of-textarea ${errors.howToApply ? "of-input--error" : ""}`}
                      placeholder="Describe the application process…" rows={3} />
            <FieldError message={errors.howToApply} />
          </div>

          <div className="of-row">
            <div className="of-field">
              <FieldLabel htmlFor="deadline">Application deadline</FieldLabel>
              <input id="deadline" type="date" value={deadline}
                     onChange={(e) => setDeadline(e.target.value)}
                     className="of-input" />
            </div>
            <div className="of-field" data-error={errors.applyUrl || undefined}>
              <FieldLabel htmlFor="applyUrl">External apply URL</FieldLabel>
              <input id="applyUrl" type="url" value={applyUrl}
                     onChange={(e) => setApplyUrl(e.target.value)}
                     className={`of-input ${errors.applyUrl ? "of-input--error" : ""}`}
                     placeholder="https://…" />
              <FieldError message={errors.applyUrl} />
            </div>
          </div>

          <div className="of-field">
            <label className="of-toggle-label">
              <input type="checkbox" checked={featured}
                     onChange={(e) => setFeatured(e.target.checked)}
                     className="of-toggle-input" />
              <span className="of-toggle-track" aria-hidden="true" />
              <span className="of-toggle-text">
              Feature on homepage
              <span className="of-hint of-hint--inline">
                Featured opportunities appear in the homepage Opportunities section.
              </span>
            </span>
            </label>
          </div>
        </div>

        <div className="of-card">
          <SectionHeading>Cover image</SectionHeading>
          <p className="of-section-desc">
            Uploaded to Supabase Storage. Recommended: 1200 × 630px, JPG or PNG.
          </p>

          {imagePreview ? (
              <div className="of-image-preview-wrap">
                <img src={imagePreview} alt="Cover preview" className="of-image-preview" />
                <button type="button" onClick={clearImage} className="of-image-clear">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Remove image
                </button>
              </div>
          ) : (
              <label className="of-image-drop" htmlFor="cover-image">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="var(--yah-light-gray)" strokeWidth="1.5" />
                  <circle cx="8.5" cy="8.5" r="1.5" stroke="var(--yah-light-gray)" strokeWidth="1.5" />
                  <path d="M21 15l-5-5L5 21" stroke="var(--yah-light-gray)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="of-image-drop-label">Click to upload a cover image</span>
                <span className="of-hint">JPG, PNG or WebP — max 5 MB</span>
                <input id="cover-image" type="file"
                       accept="image/jpeg,image/png,image/webp"
                       onChange={handleImageChange}
                       className="of-sr-only" />
              </label>
          )}
        </div>

        <div className="of-card">
          <SectionHeading>Eligibility requirements</SectionHeading>
          <p className="of-section-desc">Who can apply? Add one requirement per line.</p>

          {errors.eligibility && (
              <div className="of-inline-error" role="alert">{errors.eligibility}</div>
          )}

          <div className="of-list">
            {eligibility.map((item, i) => (
                <div key={i} className="of-list-row">
              <span className="of-list-bullet" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <polyline points="20 6 9 17 4 12" stroke="var(--yah-teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
                  <input type="text" value={item}
                         onChange={(e) => updateEligibility(i, e.target.value)}
                         className="of-input"
                         placeholder={`Requirement ${i + 1}`}
                         aria-label={`Eligibility requirement ${i + 1}`} />
                  {eligibility.length > 1 && (
                      <button type="button" onClick={() => removeEligibility(i)}
                              className="of-remove-btn" aria-label={`Remove requirement ${i + 1}`}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>
                  )}
                </div>
            ))}
          </div>

          <button type="button" onClick={addEligibility} className="of-add-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Add requirement
          </button>
        </div>

        <div className="of-actions">
          <button type="button" onClick={() => router.push("/admin/opportunities")}
                  className="of-cancel-btn" disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="of-submit-btn"
                  disabled={saving || uploadingImage}>
            {saving || uploadingImage ? (
                <>
                  <span className="of-spinner" aria-hidden="true" />
                  {uploadingImage ? "Uploading image…" : "Saving…"}
                </>
            ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points="17 21 17 13 7 13 7 21" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points="7 3 7 8 15 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {isEdit ? "Save changes" : "Create opportunity"}
                </>
            )}
          </button>
        </div>

        <style>{`
        .of-form { display:flex; flex-direction:column; gap:1.25rem; max-width:780px; }
        .of-card { background:var(--yah-white); border:1.5px solid var(--yah-light-gray); border-radius:var(--radius-lg); padding:1.75rem; display:flex; flex-direction:column; gap:1.125rem; }
        .of-section-heading { font-family:var(--font-heading); font-size:1rem; font-weight:700; color:var(--yah-navy); margin:0 0 0.125rem; padding-bottom:0.75rem; border-bottom:1px solid var(--yah-light-gray); }
        .of-section-desc { font-size:0.875rem; color:var(--yah-slate); margin:-0.5rem 0 0; }
        .of-field { display:flex; flex-direction:column; gap:0.375rem; flex:1; }
        .of-row { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
        .of-label { font-family:var(--font-heading); font-size:0.8125rem; font-weight:600; color:var(--yah-navy); letter-spacing:0.01em; }
        .of-required { color:#dc2626; }
        .of-input,.of-textarea,.of-select { padding:0.6875rem 0.875rem; border:1.5px solid var(--yah-light-gray); border-radius:var(--radius-md); font-size:0.9375rem; font-family:var(--font-body); color:var(--yah-navy); background:var(--yah-white); transition:border-color 150ms ease,box-shadow 150ms ease; outline:none; width:100%; }
        .of-input::placeholder,.of-textarea::placeholder { color:var(--yah-slate); opacity:0.4; }
        .of-input:focus,.of-textarea:focus,.of-select:focus { border-color:var(--yah-navy); box-shadow:0 0 0 3px rgba(27,47,107,0.08); }
        .of-input--error { border-color:#dc2626 !important; box-shadow:0 0 0 3px rgba(220,38,38,0.08) !important; }
        .of-input--mono { font-family:ui-monospace,monospace; font-size:0.875rem; }
        .of-textarea { resize:vertical; min-height:90px; }
        .of-select { appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M6 9l6 6 6-6' stroke='%234A5568' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 0.875rem center; padding-right:2.5rem; cursor:pointer; }
        .of-hint { font-size:0.75rem; color:var(--yah-slate); opacity:0.7; }
        .of-hint--inline { font-weight:400; font-family:var(--font-body); }
        .of-field-error,.of-inline-error { font-size:0.8125rem; color:#dc2626; font-weight:500; }
        .of-inline-error { padding:0.625rem 0.875rem; background:rgba(220,38,38,0.06); border:1px solid rgba(220,38,38,0.2); border-radius:var(--radius-md); }
        .of-global-error { display:flex; align-items:center; gap:0.625rem; padding:0.875rem 1rem; background:rgba(220,38,38,0.06); border:1px solid rgba(220,38,38,0.2); border-radius:var(--radius-md); color:#dc2626; font-size:0.875rem; font-weight:500; }
        .of-toggle-label { display:flex; align-items:center; gap:0.75rem; cursor:pointer; user-select:none; }
        .of-toggle-input { position:absolute; opacity:0; width:0; height:0; }
        .of-toggle-track { position:relative; display:inline-block; width:40px; height:22px; background:var(--yah-light-gray); border-radius:999px; flex-shrink:0; transition:background 200ms ease; }
        .of-toggle-track::after { content:""; position:absolute; top:3px; left:3px; width:16px; height:16px; background:white; border-radius:50%; transition:transform 200ms ease; box-shadow:0 1px 3px rgba(0,0,0,0.15); }
        .of-toggle-input:checked + .of-toggle-track { background:var(--yah-teal); }
        .of-toggle-input:checked + .of-toggle-track::after { transform:translateX(18px); }
        .of-toggle-text { display:flex; flex-direction:column; gap:0.125rem; font-family:var(--font-heading); font-size:0.875rem; font-weight:600; color:var(--yah-navy); }
        .of-image-drop { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:0.625rem; padding:2.5rem 1.5rem; border:2px dashed var(--yah-light-gray); border-radius:var(--radius-lg); cursor:pointer; text-align:center; transition:border-color 150ms ease,background 150ms ease; }
        .of-image-drop:hover { border-color:var(--yah-teal); background:rgba(43,174,142,0.03); }
        .of-image-drop-label { font-family:var(--font-heading); font-size:0.875rem; font-weight:600; color:var(--yah-navy); }
        .of-image-preview-wrap { display:flex; flex-direction:column; gap:0.75rem; align-items:flex-start; }
        .of-image-preview { width:100%; max-height:220px; object-fit:cover; border-radius:var(--radius-md); border:1.5px solid var(--yah-light-gray); }
        .of-image-clear { display:inline-flex; align-items:center; gap:0.375rem; font-size:0.8125rem; font-weight:600; color:#dc2626; background:rgba(220,38,38,0.06); border:1px solid rgba(220,38,38,0.2); border-radius:var(--radius-sm); padding:0.375rem 0.75rem; cursor:pointer; transition:background 150ms ease; font-family:var(--font-heading); }
        .of-image-clear:hover { background:rgba(220,38,38,0.12); }
        .of-list { display:flex; flex-direction:column; gap:0.625rem; }
        .of-list-row { display:flex; align-items:center; gap:0.625rem; }
        .of-list-bullet { flex-shrink:0; display:flex; align-items:center; }
        .of-add-btn { display:inline-flex; align-items:center; gap:0.375rem; padding:0.5rem 0.875rem; background:transparent; border:1.5px dashed var(--yah-light-gray); border-radius:var(--radius-md); font-size:0.8125rem; font-weight:600; color:var(--yah-slate); cursor:pointer; transition:border-color 150ms ease,color 150ms ease,background 150ms ease; font-family:var(--font-heading); align-self:flex-start; }
        .of-add-btn:hover { border-color:var(--yah-teal); color:var(--yah-teal); background:rgba(43,174,142,0.04); }
        .of-remove-btn { display:inline-flex; align-items:center; gap:0.3rem; padding:0.3rem 0.625rem; background:transparent; border:1px solid transparent; border-radius:var(--radius-sm); font-size:0.75rem; font-weight:600; color:var(--yah-slate); cursor:pointer; transition:background 150ms ease,color 150ms ease; font-family:var(--font-heading); flex-shrink:0; }
        .of-remove-btn:hover { background:rgba(220,38,38,0.06); color:#dc2626; }
        .of-sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
        .of-actions { display:flex; align-items:center; justify-content:flex-end; gap:0.75rem; padding:1rem 0 0.5rem; }
        .of-cancel-btn { padding:0.6875rem 1.25rem; background:transparent; border:1.5px solid var(--yah-light-gray); border-radius:var(--radius-md); font-size:0.875rem; font-weight:600; color:var(--yah-slate); cursor:pointer; transition:border-color 150ms ease,color 150ms ease; font-family:var(--font-heading); }
        .of-cancel-btn:hover:not(:disabled) { border-color:var(--yah-navy); color:var(--yah-navy); }
        .of-cancel-btn:disabled { opacity:0.5; cursor:not-allowed; }
        .of-submit-btn { display:inline-flex; align-items:center; gap:0.5rem; padding:0.6875rem 1.5rem; background:var(--yah-navy); color:var(--yah-white); border:none; border-radius:var(--radius-md); font-size:0.875rem; font-weight:700; cursor:pointer; transition:background 150ms ease,transform 150ms ease; font-family:var(--font-heading); }
        .of-submit-btn:hover:not(:disabled) { background:var(--yah-dark); transform:translateY(-1px); }
        .of-submit-btn:disabled { opacity:0.6; cursor:not-allowed; transform:none; }
        .of-spinner { display:inline-block; width:14px; height:14px; border:2px solid rgba(255,255,255,0.3); border-top-color:white; border-radius:50%; animation:of-spin 0.7s linear infinite; }
        @keyframes of-spin { to { transform:rotate(360deg); } }
        @media (max-width:600px) {
          .of-row { grid-template-columns:1fr; }
          .of-card { padding:1.25rem; }
          .of-actions { flex-direction:column-reverse; }
          .of-cancel-btn,.of-submit-btn { width:100%; justify-content:center; }
        }
      `}</style>
      </form>
  );
}