"use client";

/**
 * ProgramForm
 *
 * Shared form used by both:
 *  - /admin/programs/new    (create mode — no initial data)
 *  - /admin/programs/[slug] (edit mode   — prefilled with existing program)
 *
 * Handles:
 *  - All Program fields including nested mentors[] and outcomes[]
 *  - Cover image upload to Supabase Storage (yah-media/programs/)
 *  - Slug auto-generation from title (create mode only)
 *  - Full client-side validation before submit
 *  - Create (INSERT) and update (UPDATE) via Supabase client
 *
 * @module components/admin/ProgramForm
 */

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Program, Mentor, ProgramCategory, ProgramStatus } from "@/types/program";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const CATEGORIES: ProgramCategory[] = [
  "mentorship", "skills", "leadership", "entrepreneurship", "career",
];

const STATUSES: { value: ProgramStatus; label: string }[] = [
  { value: "open",        label: "Open" },
  { value: "closed",      label: "Closed" },
  { value: "coming-soon", label: "Coming soon" },
];

const EMPTY_MENTOR: Mentor = {
  name: "", title: "", organisation: "", bio: "", photo: "", linkedIn: "",
};

// ─── Small sub-components ─────────────────────────────────────────────────────

function FieldLabel({
  htmlFor,
  children,
  required,
}: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="pf-label">
      {children}
      {required && <span className="pf-required" aria-hidden="true"> *</span>}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <span className="pf-field-error" role="alert">{message}</span>;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="pf-section-heading">{children}</h3>;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProgramFormProps {
  program?: Program;
}

type FormErrors = Partial<Record<string, string>>;

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProgramForm({ program }: ProgramFormProps) {
  const router = useRouter();
  const isEdit = !!program;

  // Core fields
  const [title,       setTitle]       = useState(program?.title       ?? "");
  const [slug,        setSlug]        = useState(program?.slug        ?? "");
  const [tagline,     setTagline]     = useState(program?.tagline     ?? "");
  const [description, setDescription] = useState(program?.description ?? "");
  const [category,    setCategory]    = useState<ProgramCategory>(program?.category ?? "mentorship");
  const [status,      setStatus]      = useState<ProgramStatus>(program?.status     ?? "coming-soon");
  const [duration,    setDuration]    = useState(program?.duration    ?? "");
  const [audience,    setAudience]    = useState(program?.audience    ?? "");
  const [partner,     setPartner]     = useState(program?.partner     ?? "");
  const [startDate,   setStartDate]   = useState(program?.startDate?.slice(0, 10) ?? "");
  const [featured,    setFeatured]    = useState(program?.featured    ?? false);

  // Outcomes
  const [outcomes, setOutcomes] = useState<string[]>(
    program?.outcomes?.length ? program.outcomes : [""]
  );

  // Mentors
  const [mentors, setMentors] = useState<Mentor[]>(
    program?.mentors?.length ? program.mentors : [{ ...EMPTY_MENTOR }]
  );

  // Image
  const [imageFile,     setImageFile]     = useState<File | null>(null);
  const [imagePreview,  setImagePreview]  = useState<string | null>(program?.photo ?? null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // UI state
  const [errors,      setErrors]      = useState<FormErrors>({});
  const [saving,      setSaving]      = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Slug auto-gen (create mode only)
  function handleTitleChange(value: string) {
    setTitle(value);
    if (!isEdit) setSlug(slugify(value));
  }

  // Outcomes
  const updateOutcome = (i: number, v: string) =>
    setOutcomes((p) => p.map((o, idx) => (idx === i ? v : o)));
  const addOutcome    = () => setOutcomes((p) => [...p, ""]);
  const removeOutcome = (i: number) => setOutcomes((p) => p.filter((_, idx) => idx !== i));

  // Mentors
  const updateMentor = (i: number, field: keyof Mentor, v: string) =>
    setMentors((p) => p.map((m, idx) => (idx === i ? { ...m, [field]: v } : m)));
  const addMentor    = () => setMentors((p) => [...p, { ...EMPTY_MENTOR }]);
  const removeMentor = (i: number) => setMentors((p) => p.filter((_, idx) => idx !== i));

  // Image selection
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

  // Image upload
  const uploadImage = useCallback(async (file: File, slug: string): Promise<string | null> => {
    setUploadingImage(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `programs/${slug}-${Date.now()}.${ext}`;

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

  // Validation
  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!title.trim())       e.title       = "Title is required.";
    if (!slug.trim())        e.slug        = "Slug is required.";
    if (!tagline.trim())     e.tagline     = "Tagline is required.";
    if (!description.trim()) e.description = "Description is required.";
    if (!duration.trim())    e.duration    = "Duration is required.";
    if (!audience.trim())    e.audience    = "Audience is required.";

    if (!outcomes.filter((o) => o.trim()).length)
      e.outcomes = "At least one outcome is required.";

    mentors.forEach((m, i) => {
      if (!m.name.trim())         e[`mentor_${i}_name`]  = "Mentor name is required.";
      if (!m.title.trim())        e[`mentor_${i}_title`] = "Professional title is required.";
      if (!m.organisation.trim()) e[`mentor_${i}_org`]   = "Organisation is required.";
      if (!m.bio.trim())          e[`mentor_${i}_bio`]   = "Bio is required.";
    });

    return e;
  }

  // Submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGlobalError(null);

    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      document.querySelector("[data-error]")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setErrors({});
    setSaving(true);

    const supabase = createClient();

    // Upload new image if selected
    let coverImageUrl: string | null = imagePreview ?? null;
    if (imageFile) {
      coverImageUrl = await uploadImage(imageFile, slug);
      if (!coverImageUrl) { setSaving(false); return; }
    }

    const payload = {
      slug:        slug.trim(),
      title:       title.trim(),
      tagline:     tagline.trim(),
      description: description.trim(),
      category,
      status,
      duration:    duration.trim(),
      audience:    audience.trim(),
      outcomes:    outcomes.filter((o) => o.trim()),
      mentors:     mentors.map((m) => ({
        name:         m.name.trim(),
        title:        m.title.trim(),
        organisation: m.organisation.trim(),
        bio:          m.bio.trim(),
        ...(m.photo?.trim()    && { photo:    m.photo.trim() }),
        ...(m.linkedIn?.trim() && { linkedIn: m.linkedIn.trim() }),
      })),
      featured,
      cover_image: coverImageUrl,
      ...(startDate        && { start_date: startDate }),
      ...(partner.trim()   && { partner:    partner.trim() }),
    };

    if (isEdit) {
      const { error } = await supabase
        .from("programs")
        .update(payload)
        .eq("slug", program!.slug);

      if (error) {
        setGlobalError(`Failed to save: ${error.message}`);
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase.from("programs").insert(payload);

      if (error) {
        setGlobalError(
          error.code === "23505"
            ? "A program with this slug already exists. Change the title or edit the slug manually."
            : `Failed to create: ${error.message}`
        );
        setSaving(false);
        return;
      }
    }

    router.push("/admin/programs");
    router.refresh();
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="pf-form" noValidate>

      {/* Global error */}
      {globalError && (
        <div className="pf-global-error" role="alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.75" />
            <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {globalError}
        </div>
      )}

      {/* ── Core details ── */}
      <div className="pf-card">
        <SectionHeading>Core details</SectionHeading>

        <div className="pf-field" data-error={errors.title || undefined}>
          <FieldLabel htmlFor="title" required>Title</FieldLabel>
          <input id="title" type="text" value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className={`pf-input ${errors.title ? "pf-input--error" : ""}`}
            placeholder="e.g. Career Mentorship Program" />
          <FieldError message={errors.title} />
        </div>

        <div className="pf-field" data-error={errors.slug || undefined}>
          <FieldLabel htmlFor="slug" required>Slug</FieldLabel>
          <input id="slug" type="text" value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            className={`pf-input pf-input--mono ${errors.slug ? "pf-input--error" : ""}`}
            placeholder="career-mentorship-program"
            readOnly={isEdit}
            aria-describedby="slug-hint" />
          <span id="slug-hint" className="pf-hint">
            {isEdit
              ? "Slug cannot be changed after creation."
              : "Auto-generated from title. Used in the URL: /programs/[slug]"}
          </span>
          <FieldError message={errors.slug} />
        </div>

        <div className="pf-field" data-error={errors.tagline || undefined}>
          <FieldLabel htmlFor="tagline" required>Tagline</FieldLabel>
          <input id="tagline" type="text" value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className={`pf-input ${errors.tagline ? "pf-input--error" : ""}`}
            placeholder="One-line summary shown on cards" maxLength={120} />
          <FieldError message={errors.tagline} />
        </div>

        <div className="pf-field" data-error={errors.description || undefined}>
          <FieldLabel htmlFor="description" required>Description</FieldLabel>
          <textarea id="description" value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`pf-textarea ${errors.description ? "pf-input--error" : ""}`}
            placeholder="Full description shown on the program detail page…" rows={5} />
          <FieldError message={errors.description} />
        </div>

        <div className="pf-row">
          <div className="pf-field">
            <FieldLabel htmlFor="category" required>Category</FieldLabel>
            <select id="category" value={category}
              onChange={(e) => setCategory(e.target.value as ProgramCategory)}
              className="pf-select">
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="pf-field">
            <FieldLabel htmlFor="status" required>Status</FieldLabel>
            <select id="status" value={status}
              onChange={(e) => setStatus(e.target.value as ProgramStatus)}
              className="pf-select">
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="pf-row">
          <div className="pf-field" data-error={errors.duration || undefined}>
            <FieldLabel htmlFor="duration" required>Duration</FieldLabel>
            <input id="duration" type="text" value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className={`pf-input ${errors.duration ? "pf-input--error" : ""}`}
              placeholder="e.g. 12 weeks" />
            <FieldError message={errors.duration} />
          </div>
          <div className="pf-field" data-error={errors.audience || undefined}>
            <FieldLabel htmlFor="audience" required>Audience</FieldLabel>
            <input id="audience" type="text" value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className={`pf-input ${errors.audience ? "pf-input--error" : ""}`}
              placeholder="e.g. Tertiary students (18–30)" />
            <FieldError message={errors.audience} />
          </div>
        </div>

        <div className="pf-row">
          <div className="pf-field">
            <FieldLabel htmlFor="startDate">Start date</FieldLabel>
            <input id="startDate" type="date" value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="pf-input" />
          </div>
          <div className="pf-field">
            <FieldLabel htmlFor="partner">Partner organisation</FieldLabel>
            <input id="partner" type="text" value={partner}
              onChange={(e) => setPartner(e.target.value)}
              className="pf-input" placeholder="e.g. Econet Wireless" />
          </div>
        </div>

        <div className="pf-field">
          <label className="pf-toggle-label">
            <input type="checkbox" checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="pf-toggle-input" />
            <span className="pf-toggle-track" aria-hidden="true" />
            <span className="pf-toggle-text">
              Feature on homepage
              <span className="pf-hint pf-hint--inline">
                Featured programs appear in the homepage Programs section.
              </span>
            </span>
          </label>
        </div>
      </div>

      {/* ── Cover image ── */}
      <div className="pf-card">
        <SectionHeading>Cover image</SectionHeading>
        <p className="pf-section-desc">
          Uploaded to Supabase Storage. Recommended: 1200 × 630px, JPG or PNG.
        </p>

        {imagePreview ? (
          <div className="pf-image-preview-wrap">
            <img src={imagePreview} alt="Cover preview" className="pf-image-preview" />
            <button type="button" onClick={clearImage} className="pf-image-clear">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Remove image
            </button>
          </div>
        ) : (
          <label className="pf-image-drop" htmlFor="cover-image">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="var(--yah-light-gray)" strokeWidth="1.5" />
              <circle cx="8.5" cy="8.5" r="1.5" stroke="var(--yah-light-gray)" strokeWidth="1.5" />
              <path d="M21 15l-5-5L5 21" stroke="var(--yah-light-gray)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="pf-image-drop-label">Click to upload a cover image</span>
            <span className="pf-hint">JPG, PNG or WebP — max 5 MB</span>
            <input id="cover-image" type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange} className="pf-sr-only" />
          </label>
        )}
      </div>

      {/* ── Outcomes ── */}
      <div className="pf-card">
        <SectionHeading>Key outcomes</SectionHeading>
        <p className="pf-section-desc">What will participants gain? Add one outcome per line.</p>

        {errors.outcomes && (
          <div className="pf-inline-error" role="alert">{errors.outcomes}</div>
        )}

        <div className="pf-outcomes-list">
          {outcomes.map((outcome, i) => (
            <div key={i} className="pf-outcome-row">
              <span className="pf-outcome-bullet" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <polyline points="20 6 9 17 4 12" stroke="var(--yah-teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <input type="text" value={outcome}
                onChange={(e) => updateOutcome(i, e.target.value)}
                className="pf-input" placeholder={`Outcome ${i + 1}`}
                aria-label={`Outcome ${i + 1}`} />
              {outcomes.length > 1 && (
                <button type="button" onClick={() => removeOutcome(i)}
                  className="pf-remove-btn" aria-label={`Remove outcome ${i + 1}`}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        <button type="button" onClick={addOutcome} className="pf-add-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Add outcome
        </button>
      </div>

      {/* ── Mentors ── */}
      <div className="pf-card">
        <SectionHeading>Mentors</SectionHeading>
        <p className="pf-section-desc">Add one or more mentors leading this program.</p>

        {mentors.map((mentor, i) => (
          <div key={i} className="pf-mentor-card">
            <div className="pf-mentor-header">
              <span className="pf-mentor-label">Mentor {i + 1}</span>
              {mentors.length > 1 && (
                <button type="button" onClick={() => removeMentor(i)}
                  className="pf-remove-btn" aria-label={`Remove mentor ${i + 1}`}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Remove
                </button>
              )}
            </div>

            <div className="pf-row">
              <div className="pf-field" data-error={errors[`mentor_${i}_name`] || undefined}>
                <FieldLabel htmlFor={`mentor-${i}-name`} required>Full name</FieldLabel>
                <input id={`mentor-${i}-name`} type="text" value={mentor.name}
                  onChange={(e) => updateMentor(i, "name", e.target.value)}
                  className={`pf-input ${errors[`mentor_${i}_name`] ? "pf-input--error" : ""}`}
                  placeholder="Dr. Tendai Moyo" />
                <FieldError message={errors[`mentor_${i}_name`]} />
              </div>
              <div className="pf-field" data-error={errors[`mentor_${i}_title`] || undefined}>
                <FieldLabel htmlFor={`mentor-${i}-title`} required>Professional title</FieldLabel>
                <input id={`mentor-${i}-title`} type="text" value={mentor.title}
                  onChange={(e) => updateMentor(i, "title", e.target.value)}
                  className={`pf-input ${errors[`mentor_${i}_title`] ? "pf-input--error" : ""}`}
                  placeholder="Senior Economist" />
                <FieldError message={errors[`mentor_${i}_title`]} />
              </div>
            </div>

            <div className="pf-field" data-error={errors[`mentor_${i}_org`] || undefined}>
              <FieldLabel htmlFor={`mentor-${i}-org`} required>Organisation</FieldLabel>
              <input id={`mentor-${i}-org`} type="text" value={mentor.organisation}
                onChange={(e) => updateMentor(i, "organisation", e.target.value)}
                className={`pf-input ${errors[`mentor_${i}_org`] ? "pf-input--error" : ""}`}
                placeholder="Ministry of Finance" />
              <FieldError message={errors[`mentor_${i}_org`]} />
            </div>

            <div className="pf-field" data-error={errors[`mentor_${i}_bio`] || undefined}>
              <FieldLabel htmlFor={`mentor-${i}-bio`} required>
                Bio{" "}
                <span className="pf-hint pf-hint--inline">(max 200 characters)</span>
              </FieldLabel>
              <textarea id={`mentor-${i}-bio`} value={mentor.bio}
                onChange={(e) => updateMentor(i, "bio", e.target.value)}
                className={`pf-textarea ${errors[`mentor_${i}_bio`] ? "pf-input--error" : ""}`}
                placeholder="Short professional bio…" rows={3} maxLength={200} />
              <span className="pf-char-count">{mentor.bio.length}/200</span>
              <FieldError message={errors[`mentor_${i}_bio`]} />
            </div>

            <div className="pf-row">
              <div className="pf-field">
                <FieldLabel htmlFor={`mentor-${i}-linkedin`}>LinkedIn URL</FieldLabel>
                <input id={`mentor-${i}-linkedin`} type="url"
                  value={mentor.linkedIn ?? ""}
                  onChange={(e) => updateMentor(i, "linkedIn", e.target.value)}
                  className="pf-input" placeholder="https://linkedin.com/in/…" />
              </div>
              <div className="pf-field">
                <FieldLabel htmlFor={`mentor-${i}-photo`}>Photo URL</FieldLabel>
                <input id={`mentor-${i}-photo`} type="url"
                  value={mentor.photo ?? ""}
                  onChange={(e) => updateMentor(i, "photo", e.target.value)}
                  className="pf-input" placeholder="https://…" />
              </div>
            </div>
          </div>
        ))}

        <button type="button" onClick={addMentor} className="pf-add-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Add mentor
        </button>
      </div>

      {/* ── Actions ── */}
      <div className="pf-actions">
        <button type="button" onClick={() => router.push("/admin/programs")}
          className="pf-cancel-btn" disabled={saving}>
          Cancel
        </button>
        <button type="submit" className="pf-submit-btn" disabled={saving || uploadingImage}>
          {saving || uploadingImage ? (
            <>
              <span className="pf-spinner" aria-hidden="true" />
              {uploadingImage ? "Uploading image…" : "Saving…"}
            </>
          ) : (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="17 21 17 13 7 13 7 21" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="7 3 7 8 15 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {isEdit ? "Save changes" : "Create program"}
            </>
          )}
        </button>
      </div>

      <style>{`
        .pf-form { display:flex; flex-direction:column; gap:1.25rem; max-width:780px; }

        .pf-card { background:var(--yah-white); border:1.5px solid var(--yah-light-gray); border-radius:var(--radius-lg); padding:1.75rem; display:flex; flex-direction:column; gap:1.125rem; }

        .pf-section-heading { font-family:var(--font-heading); font-size:1rem; font-weight:700; color:var(--yah-navy); margin:0 0 0.125rem; padding-bottom:0.75rem; border-bottom:1px solid var(--yah-light-gray); }

        .pf-section-desc { font-size:0.875rem; color:var(--yah-slate); margin:-0.5rem 0 0; }

        .pf-field { display:flex; flex-direction:column; gap:0.375rem; flex:1; }
        .pf-row { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }

        .pf-label { font-family:var(--font-heading); font-size:0.8125rem; font-weight:600; color:var(--yah-navy); letter-spacing:0.01em; }
        .pf-required { color:#dc2626; }

        .pf-input, .pf-textarea, .pf-select { padding:0.6875rem 0.875rem; border:1.5px solid var(--yah-light-gray); border-radius:var(--radius-md); font-size:0.9375rem; font-family:var(--font-body); color:var(--yah-navy); background:var(--yah-white); transition:border-color 150ms ease, box-shadow 150ms ease; outline:none; width:100%; }
        .pf-input::placeholder, .pf-textarea::placeholder { color:var(--yah-slate); opacity:0.4; }
        .pf-input:focus, .pf-textarea:focus, .pf-select:focus { border-color:var(--yah-navy); box-shadow:0 0 0 3px rgba(27,47,107,0.08); }
        .pf-input--error { border-color:#dc2626 !important; box-shadow:0 0 0 3px rgba(220,38,38,0.08) !important; }
        .pf-input--mono { font-family:ui-monospace,monospace; font-size:0.875rem; }
        .pf-textarea { resize:vertical; min-height:100px; }
        .pf-select { appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M6 9l6 6 6-6' stroke='%234A5568' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 0.875rem center; padding-right:2.5rem; cursor:pointer; }

        .pf-hint { font-size:0.75rem; color:var(--yah-slate); opacity:0.7; }
        .pf-hint--inline { font-weight:400; font-family:var(--font-body); }
        .pf-char-count { font-size:0.75rem; color:var(--yah-slate); opacity:0.6; text-align:right; margin-top:-0.25rem; }

        .pf-field-error, .pf-inline-error { font-size:0.8125rem; color:#dc2626; font-weight:500; }
        .pf-inline-error { padding:0.625rem 0.875rem; background:rgba(220,38,38,0.06); border:1px solid rgba(220,38,38,0.2); border-radius:var(--radius-md); }

        .pf-global-error { display:flex; align-items:center; gap:0.625rem; padding:0.875rem 1rem; background:rgba(220,38,38,0.06); border:1px solid rgba(220,38,38,0.2); border-radius:var(--radius-md); color:#dc2626; font-size:0.875rem; font-weight:500; }

        .pf-toggle-label { display:flex; align-items:center; gap:0.75rem; cursor:pointer; user-select:none; }
        .pf-toggle-input { position:absolute; opacity:0; width:0; height:0; }
        .pf-toggle-track { position:relative; display:inline-block; width:40px; height:22px; background:var(--yah-light-gray); border-radius:999px; flex-shrink:0; transition:background 200ms ease; }
        .pf-toggle-track::after { content:""; position:absolute; top:3px; left:3px; width:16px; height:16px; background:white; border-radius:50%; transition:transform 200ms ease; box-shadow:0 1px 3px rgba(0,0,0,0.15); }
        .pf-toggle-input:checked + .pf-toggle-track { background:var(--yah-teal); }
        .pf-toggle-input:checked + .pf-toggle-track::after { transform:translateX(18px); }
        .pf-toggle-text { display:flex; flex-direction:column; gap:0.125rem; font-family:var(--font-heading); font-size:0.875rem; font-weight:600; color:var(--yah-navy); }

        .pf-image-drop { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:0.625rem; padding:2.5rem 1.5rem; border:2px dashed var(--yah-light-gray); border-radius:var(--radius-lg); cursor:pointer; text-align:center; transition:border-color 150ms ease, background 150ms ease; }
        .pf-image-drop:hover { border-color:var(--yah-teal); background:rgba(43,174,142,0.03); }
        .pf-image-drop-label { font-family:var(--font-heading); font-size:0.875rem; font-weight:600; color:var(--yah-navy); }
        .pf-image-preview-wrap { display:flex; flex-direction:column; gap:0.75rem; align-items:flex-start; }
        .pf-image-preview { width:100%; max-height:220px; object-fit:cover; border-radius:var(--radius-md); border:1.5px solid var(--yah-light-gray); }
        .pf-image-clear { display:inline-flex; align-items:center; gap:0.375rem; font-size:0.8125rem; font-weight:600; color:#dc2626; background:rgba(220,38,38,0.06); border:1px solid rgba(220,38,38,0.2); border-radius:var(--radius-sm); padding:0.375rem 0.75rem; cursor:pointer; transition:background 150ms ease; font-family:var(--font-heading); }
        .pf-image-clear:hover { background:rgba(220,38,38,0.12); }

        .pf-outcomes-list { display:flex; flex-direction:column; gap:0.625rem; }
        .pf-outcome-row { display:flex; align-items:center; gap:0.625rem; }
        .pf-outcome-bullet { flex-shrink:0; display:flex; align-items:center; }

        .pf-mentor-card { border:1.5px solid var(--yah-light-gray); border-radius:var(--radius-md); padding:1.25rem; display:flex; flex-direction:column; gap:0.875rem; background:var(--yah-off-white); }
        .pf-mentor-header { display:flex; align-items:center; justify-content:space-between; }
        .pf-mentor-label { font-family:var(--font-heading); font-size:0.8125rem; font-weight:700; color:var(--yah-navy); text-transform:uppercase; letter-spacing:0.05em; }

        .pf-add-btn { display:inline-flex; align-items:center; gap:0.375rem; padding:0.5rem 0.875rem; background:transparent; border:1.5px dashed var(--yah-light-gray); border-radius:var(--radius-md); font-size:0.8125rem; font-weight:600; color:var(--yah-slate); cursor:pointer; transition:border-color 150ms ease, color 150ms ease, background 150ms ease; font-family:var(--font-heading); align-self:flex-start; }
        .pf-add-btn:hover { border-color:var(--yah-teal); color:var(--yah-teal); background:rgba(43,174,142,0.04); }

        .pf-remove-btn { display:inline-flex; align-items:center; gap:0.3rem; padding:0.3rem 0.625rem; background:transparent; border:1px solid transparent; border-radius:var(--radius-sm); font-size:0.75rem; font-weight:600; color:var(--yah-slate); cursor:pointer; transition:background 150ms ease, color 150ms ease; font-family:var(--font-heading); flex-shrink:0; }
        .pf-remove-btn:hover { background:rgba(220,38,38,0.06); color:#dc2626; }

        .pf-sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }

        .pf-actions { display:flex; align-items:center; justify-content:flex-end; gap:0.75rem; padding:1rem 0 0.5rem; }
        .pf-cancel-btn { padding:0.6875rem 1.25rem; background:transparent; border:1.5px solid var(--yah-light-gray); border-radius:var(--radius-md); font-size:0.875rem; font-weight:600; color:var(--yah-slate); cursor:pointer; transition:border-color 150ms ease, color 150ms ease; font-family:var(--font-heading); }
        .pf-cancel-btn:hover:not(:disabled) { border-color:var(--yah-navy); color:var(--yah-navy); }
        .pf-cancel-btn:disabled { opacity:0.5; cursor:not-allowed; }
        .pf-submit-btn { display:inline-flex; align-items:center; gap:0.5rem; padding:0.6875rem 1.5rem; background:var(--yah-navy); color:var(--yah-white); border:none; border-radius:var(--radius-md); font-size:0.875rem; font-weight:700; cursor:pointer; transition:background 150ms ease, transform 150ms ease; font-family:var(--font-heading); }
        .pf-submit-btn:hover:not(:disabled) { background:var(--yah-dark); transform:translateY(-1px); }
        .pf-submit-btn:disabled { opacity:0.6; cursor:not-allowed; transform:none; }

        .pf-spinner { display:inline-block; width:14px; height:14px; border:2px solid rgba(255,255,255,0.3); border-top-color:white; border-radius:50%; animation:pf-spin 0.7s linear infinite; }
        @keyframes pf-spin { to { transform:rotate(360deg); } }

        @media (max-width:600px) {
          .pf-row { grid-template-columns:1fr; }
          .pf-card { padding:1.25rem; }
          .pf-actions { flex-direction:column-reverse; }
          .pf-cancel-btn, .pf-submit-btn { width:100%; justify-content:center; }
        }
      `}</style>
    </form>
  );
}
