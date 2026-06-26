"use client";

/**
 * PartnerForm
 *
 * Shared form used by both:
 *  - /admin/partners/new    (create mode)
 *  - /admin/partners/[slug] (edit mode - prefilled)
 *
 * Simpler than ProgramForm/OpportunityForm - no nested arrays
 * (no mentors, outcomes, or eligibility lists), just flat fields
 * plus one logo image upload.
 *
 * Image upload uses the same client-upload, server-write split
 * (Option A) as programs/opportunities: browser uploads directly
 * to Supabase Storage, then passes the public URL to the server
 * action, which only ever touches the database.
 *
 * @module components/admin/PartnerForm
 */

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createPartner, updatePartner } from "@/actions/partners";
import type { Partner, PartnerType } from "@/types/partner";

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const PARTNER_TYPES: { value: PartnerType; label: string }[] = [
  { value: "school",     label: "School" },
  { value: "university", label: "University" },
  { value: "ngo",         label: "NGO" },
  { value: "corporate",   label: "Corporate" },
  { value: "government",  label: "Government" },
  { value: "community",   label: "Community" },
];

function FieldLabel({ htmlFor, children, required }: {
  htmlFor: string; children: React.ReactNode; required?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="pnf-label">
      {children}
      {required && <span className="pnf-required" aria-hidden="true"> *</span>}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <span className="pnf-field-error" role="alert">{message}</span>;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="pnf-section-heading">{children}</h3>;
}

interface PartnerFormProps {
  partner?: Partner;
}

type FormErrors = Partial<Record<string, string>>;

export default function PartnerForm({ partner }: PartnerFormProps) {
  const router = useRouter();
  const isEdit = !!partner;

  const [name,         setName]         = useState(partner?.name         ?? "");
  const [slug,         setSlug]         = useState(partner?.slug         ?? "");
  const [description,  setDescription]  = useState(partner?.description  ?? "");
  const [type,         setType]         = useState<PartnerType>(partner?.type ?? "ngo");
  const [contribution, setContribution] = useState(partner?.contribution ?? "");
  const [website,      setWebsite]      = useState(partner?.website      ?? "");
  const [featured,     setFeatured]     = useState(partner?.featured     ?? false);

  const [imageFile,      setImageFile]      = useState<File | null>(null);
  const [imagePreview,   setImagePreview]   = useState<string | null>(partner?.logo ?? null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [errors,      setErrors]      = useState<FormErrors>({});
  const [saving,      setSaving]      = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  function handleNameChange(value: string) {
    setName(value);
    if (!isEdit) setSlug(slugify(value));
  }

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
    const path = `partners/${slug}-${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("yah-media")
      .upload(path, file, { upsert: true });

    setUploadingImage(false);

    if (error) {
      setGlobalError(`Logo upload failed: ${error.message}`);
      return null;
    }

    const { data } = supabase.storage.from("yah-media").getPublicUrl(path);
    return data.publicUrl;
  }, []);

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!name.trim())         e.name         = "Name is required.";
    if (!slug.trim())         e.slug         = "Slug is required.";
    if (!description.trim()) e.description  = "Description is required.";
    if (!contribution.trim()) e.contribution = "Contribution is required.";

    if (website && !/^https?:\/\/.+/.test(website))
      e.website = "Website URL must start with http:// or https://";

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

    let logoUrl: string | null = imagePreview ?? null;
    if (imageFile) {
      logoUrl = await uploadImage(imageFile, slug);
      if (!logoUrl) {
        setSaving(false);
        return;
      }
    }

    const payload = {
      slug:         slug.trim(),
      name:         name.trim(),
      description:  description.trim(),
      type,
      contribution: contribution.trim(),
      featured,
      logoUrl,
      ...(website.trim() && { website: website.trim() }),
    };

    const result = isEdit
      ? await updatePartner(partner!.slug, payload)
      : await createPartner(payload);

    if (!result.success) {
      setGlobalError(result.error ?? "Something went wrong. Please try again.");
      setSaving(false);
      return;
    }

    router.push("/admin/partners");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="pnf-form" noValidate>

      {globalError && (
        <div className="pnf-global-error" role="alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.75" />
            <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {globalError}
        </div>
      )}

      <div className="pnf-card">
        <SectionHeading>Core details</SectionHeading>

        <div className="pnf-field" data-error={errors.name || undefined}>
          <FieldLabel htmlFor="name" required>Organisation name</FieldLabel>
          <input id="name" type="text" value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className={`pnf-input ${errors.name ? "pnf-input--error" : ""}`}
            placeholder="e.g. Econet Wireless" />
          <FieldError message={errors.name} />
        </div>

        <div className="pnf-field" data-error={errors.slug || undefined}>
          <FieldLabel htmlFor="slug" required>Slug</FieldLabel>
          <input id="slug" type="text" value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            className={`pnf-input pnf-input--mono ${errors.slug ? "pnf-input--error" : ""}`}
            placeholder="econet-wireless"
            readOnly={isEdit}
            aria-describedby="slug-hint" />
          <span id="slug-hint" className="pnf-hint">
            {isEdit
              ? "Slug cannot be changed after creation."
              : "Auto-generated from the organisation name."}
          </span>
          <FieldError message={errors.slug} />
        </div>

        <div className="pnf-field" data-error={errors.description || undefined}>
          <FieldLabel htmlFor="description" required>Description</FieldLabel>
          <textarea id="description" value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`pnf-textarea ${errors.description ? "pnf-input--error" : ""}`}
            placeholder="One-line description of what they provide..." rows={3} />
          <FieldError message={errors.description} />
        </div>

        <div className="pnf-row">
          <div className="pnf-field">
            <FieldLabel htmlFor="type" required>Type</FieldLabel>
            <select id="type" value={type}
              onChange={(e) => setType(e.target.value as PartnerType)}
              className="pnf-select">
              {PARTNER_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="pnf-field" data-error={errors.website || undefined}>
            <FieldLabel htmlFor="website">Website</FieldLabel>
            <input id="website" type="url" value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className={`pnf-input ${errors.website ? "pnf-input--error" : ""}`}
              placeholder="https://..." />
            <FieldError message={errors.website} />
          </div>
        </div>

        <div className="pnf-field" data-error={errors.contribution || undefined}>
          <FieldLabel htmlFor="contribution" required>Contribution</FieldLabel>
          <textarea id="contribution" value={contribution}
            onChange={(e) => setContribution(e.target.value)}
            className={`pnf-textarea ${errors.contribution ? "pnf-input--error" : ""}`}
            placeholder="What this partner specifically provides to YAH's network..." rows={3} />
          <FieldError message={errors.contribution} />
        </div>

        <div className="pnf-field">
          <label className="pnf-toggle-label">
            <input type="checkbox" checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="pnf-toggle-input" />
            <span className="pnf-toggle-track" aria-hidden="true" />
            <span className="pnf-toggle-text">
              Feature on Partners page
              <span className="pnf-hint pnf-hint--inline">
                Featured partners are shown prominently on the public Partners page.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="pnf-card">
        <SectionHeading>Logo</SectionHeading>
        <p className="pnf-section-desc">
          Uploaded to Supabase Storage. Recommended: square, transparent background, PNG.
        </p>

        {imagePreview ? (
          <div className="pnf-image-preview-wrap">
            <img src={imagePreview} alt="Logo preview" className="pnf-image-preview" />
            <button type="button" onClick={clearImage} className="pnf-image-clear">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Remove logo
            </button>
          </div>
        ) : (
          <label className="pnf-image-drop" htmlFor="logo-image">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="var(--yah-light-gray)" strokeWidth="1.5" />
              <circle cx="8.5" cy="8.5" r="1.5" stroke="var(--yah-light-gray)" strokeWidth="1.5" />
              <path d="M21 15l-5-5L5 21" stroke="var(--yah-light-gray)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="pnf-image-drop-label">Click to upload a logo</span>
            <span className="pnf-hint">JPG, PNG or WebP - max 5 MB</span>
            <input id="logo-image" type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="pnf-sr-only" />
          </label>
        )}
      </div>

      <div className="pnf-actions">
        <button type="button" onClick={() => router.push("/admin/partners")}
          className="pnf-cancel-btn" disabled={saving}>
          Cancel
        </button>
        <button type="submit" className="pnf-submit-btn"
          disabled={saving || uploadingImage}>
          {saving || uploadingImage ? (
            <>
              <span className="pnf-spinner" aria-hidden="true" />
              {uploadingImage ? "Uploading logo..." : "Saving..."}
            </>
          ) : (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="17 21 17 13 7 13 7 21" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="7 3 7 8 15 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {isEdit ? "Save changes" : "Create partner"}
            </>
          )}
        </button>
      </div>

      <style>{`
        .pnf-form { display:flex; flex-direction:column; gap:1.25rem; max-width:780px; }
        .pnf-card { background:var(--yah-white); border:1.5px solid var(--yah-light-gray); border-radius:var(--radius-lg); padding:1.75rem; display:flex; flex-direction:column; gap:1.125rem; }
        .pnf-section-heading { font-family:var(--font-heading); font-size:1rem; font-weight:700; color:var(--yah-navy); margin:0 0 0.125rem; padding-bottom:0.75rem; border-bottom:1px solid var(--yah-light-gray); }
        .pnf-section-desc { font-size:0.875rem; color:var(--yah-slate); margin:-0.5rem 0 0; }
        .pnf-field { display:flex; flex-direction:column; gap:0.375rem; flex:1; }
        .pnf-row { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
        .pnf-label { font-family:var(--font-heading); font-size:0.8125rem; font-weight:600; color:var(--yah-navy); letter-spacing:0.01em; }
        .pnf-required { color:#dc2626; }
        .pnf-input,.pnf-textarea,.pnf-select { padding:0.6875rem 0.875rem; border:1.5px solid var(--yah-light-gray); border-radius:var(--radius-md); font-size:0.9375rem; font-family:var(--font-body); color:var(--yah-navy); background:var(--yah-white); transition:border-color 150ms ease,box-shadow 150ms ease; outline:none; width:100%; }
        .pnf-input::placeholder,.pnf-textarea::placeholder { color:var(--yah-slate); opacity:0.4; }
        .pnf-input:focus,.pnf-textarea:focus,.pnf-select:focus { border-color:var(--yah-navy); box-shadow:0 0 0 3px rgba(27,47,107,0.08); }
        .pnf-input--error { border-color:#dc2626 !important; box-shadow:0 0 0 3px rgba(220,38,38,0.08) !important; }
        .pnf-input--mono { font-family:ui-monospace,monospace; font-size:0.875rem; }
        .pnf-textarea { resize:vertical; min-height:80px; }
        .pnf-select { appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M6 9l6 6 6-6' stroke='%234A5568' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 0.875rem center; padding-right:2.5rem; cursor:pointer; }
        .pnf-hint { font-size:0.75rem; color:var(--yah-slate); opacity:0.7; }
        .pnf-hint--inline { font-weight:400; font-family:var(--font-body); }
        .pnf-field-error { font-size:0.8125rem; color:#dc2626; font-weight:500; }
        .pnf-global-error { display:flex; align-items:center; gap:0.625rem; padding:0.875rem 1rem; background:rgba(220,38,38,0.06); border:1px solid rgba(220,38,38,0.2); border-radius:var(--radius-md); color:#dc2626; font-size:0.875rem; font-weight:500; }
        .pnf-toggle-label { display:flex; align-items:center; gap:0.75rem; cursor:pointer; user-select:none; }
        .pnf-toggle-input { position:absolute; opacity:0; width:0; height:0; }
        .pnf-toggle-track { position:relative; display:inline-block; width:40px; height:22px; background:var(--yah-light-gray); border-radius:999px; flex-shrink:0; transition:background 200ms ease; }
        .pnf-toggle-track::after { content:""; position:absolute; top:3px; left:3px; width:16px; height:16px; background:white; border-radius:50%; transition:transform 200ms ease; box-shadow:0 1px 3px rgba(0,0,0,0.15); }
        .pnf-toggle-input:checked + .pnf-toggle-track { background:var(--yah-teal); }
        .pnf-toggle-input:checked + .pnf-toggle-track::after { transform:translateX(18px); }
        .pnf-toggle-text { display:flex; flex-direction:column; gap:0.125rem; font-family:var(--font-heading); font-size:0.875rem; font-weight:600; color:var(--yah-navy); }
        .pnf-image-drop { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:0.625rem; padding:2.5rem 1.5rem; border:2px dashed var(--yah-light-gray); border-radius:var(--radius-lg); cursor:pointer; text-align:center; transition:border-color 150ms ease,background 150ms ease; }
        .pnf-image-drop:hover { border-color:var(--yah-teal); background:rgba(43,174,142,0.03); }
        .pnf-image-drop-label { font-family:var(--font-heading); font-size:0.875rem; font-weight:600; color:var(--yah-navy); }
        .pnf-image-preview-wrap { display:flex; flex-direction:column; gap:0.75rem; align-items:flex-start; }
        .pnf-image-preview { width:140px; height:140px; object-fit:contain; border-radius:var(--radius-md); border:1.5px solid var(--yah-light-gray); background:var(--yah-off-white); padding:0.75rem; }
        .pnf-image-clear { display:inline-flex; align-items:center; gap:0.375rem; font-size:0.8125rem; font-weight:600; color:#dc2626; background:rgba(220,38,38,0.06); border:1px solid rgba(220,38,38,0.2); border-radius:var(--radius-sm); padding:0.375rem 0.75rem; cursor:pointer; transition:background 150ms ease; font-family:var(--font-heading); }
        .pnf-image-clear:hover { background:rgba(220,38,38,0.12); }
        .pnf-sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
        .pnf-actions { display:flex; align-items:center; justify-content:flex-end; gap:0.75rem; padding:1rem 0 0.5rem; }
        .pnf-cancel-btn { padding:0.6875rem 1.25rem; background:transparent; border:1.5px solid var(--yah-light-gray); border-radius:var(--radius-md); font-size:0.875rem; font-weight:600; color:var(--yah-slate); cursor:pointer; transition:border-color 150ms ease,color 150ms ease; font-family:var(--font-heading); }
        .pnf-cancel-btn:hover:not(:disabled) { border-color:var(--yah-navy); color:var(--yah-navy); }
        .pnf-cancel-btn:disabled { opacity:0.5; cursor:not-allowed; }
        .pnf-submit-btn { display:inline-flex; align-items:center; gap:0.5rem; padding:0.6875rem 1.5rem; background:var(--yah-navy); color:var(--yah-white); border:none; border-radius:var(--radius-md); font-size:0.875rem; font-weight:700; cursor:pointer; transition:background 150ms ease,transform 150ms ease; font-family:var(--font-heading); }
        .pnf-submit-btn:hover:not(:disabled) { background:var(--yah-dark); transform:translateY(-1px); }
        .pnf-submit-btn:disabled { opacity:0.6; cursor:not-allowed; transform:none; }
        .pnf-spinner { display:inline-block; width:14px; height:14px; border:2px solid rgba(255,255,255,0.3); border-top-color:white; border-radius:50%; animation:pnf-spin 0.7s linear infinite; }
        @keyframes pnf-spin { to { transform:rotate(360deg); } }
        @media (max-width:600px) {
          .pnf-row { grid-template-columns:1fr; }
          .pnf-card { padding:1.25rem; }
          .pnf-actions { flex-direction:column-reverse; }
          .pnf-cancel-btn,.pnf-submit-btn { width:100%; justify-content:center; }
        }
      `}</style>
    </form>
  );
}
