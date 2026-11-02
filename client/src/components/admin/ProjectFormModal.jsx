import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import Modal from '../Modal';
import { Spinner } from '../Feedback';
import { api } from '../../api/client';
import { firstError } from '../../utils/format';

const ACCENTS = [
  { value: 'terracotta', label: 'Terracotta', color: 'bg-[#d95b39]' },
  { value: 'olive', label: 'Olive', color: 'bg-[#65745f]' },
  { value: 'ink', label: 'Ink', color: 'bg-[#1b241f]' },
  { value: 'sand', label: 'Sand', color: 'bg-[#d8c39b]' },
  { value: 'clay', label: 'Clay', color: 'bg-[#a8533b]' },
  { value: 'sky', label: 'Sky', color: 'bg-[#789894]' },
];

const blankProject = () => ({
  title: '',
  description: '',
  imageUrl: '',
  repoUrl: '',
  liveUrl: '',
  techStack: '',
  year: String(new Date().getFullYear()),
  accent: 'terracotta',
  featured: false,
});

export default function ProjectFormModal({ open, project, token, onClose, onSaved }) {
  const isEdit = Boolean(project?._id);
  const [values, setValues] = useState(blankProject);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (project) {
      setValues({
        title: project.title || '',
        description: project.description || '',
        imageUrl: project.imageUrl || '',
        repoUrl: project.repoUrl || '',
        liveUrl: project.liveUrl || '',
        techStack: (project.techStack || []).join(', '),
        year: project.year || String(new Date().getFullYear()),
        accent: project.accent || 'terracotta',
        featured: Boolean(project.featured),
      });
    } else {
      setValues(blankProject());
    }
    setErrors({});
    setServerError('');
    setSaving(false);
  }, [open, project]);

  const set = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setValues((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: '' }));
    if (serverError) setServerError('');
  };

  const validate = () => {
    const next = {};
    if (!values.title.trim()) next.title = 'A title is required.';
    if (!values.description.trim()) next.description = 'A description is required.';

    for (const field of ['imageUrl', 'repoUrl', 'liveUrl']) {
      const value = values[field].trim();
      if (value && !/^(https?:\/\/|\/)/i.test(value)) {
        next[field] = 'Use a full URL starting with https:// (or a path starting with /).';
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError('');
    if (!validate()) return;

    setSaving(true);
    const payload = {
      title: values.title.trim(),
      description: values.description.trim(),
      imageUrl: values.imageUrl.trim(),
      repoUrl: values.repoUrl.trim(),
      liveUrl: values.liveUrl.trim(),
      techStack: values.techStack
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      year: values.year.trim(),
      accent: values.accent,
      featured: values.featured,
    };

    try {
      const saved = isEdit
        ? await api.projects.update(project._id, payload, token)
        : await api.projects.create(payload, token);
      onSaved(saved, isEdit ? 'updated' : 'created');
    } catch (error) {
      setServerError(firstError(error));
      if (error.errors?.length) {
        const next = {};
        error.errors.forEach((item) => {
          next[item.field] = item.message;
        });
        setErrors(next);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={saving ? () => {} : onClose}
      title={isEdit ? 'Edit project' : 'Add a project'}
      description={
        isEdit
          ? 'Update the case study details shown on the portfolio.'
          : 'A new case study will appear in the public projects gallery.'
      }
      size="lg"
      footer={
        <div className="flex items-center justify-between gap-4">
          <p className="hidden text-xs text-muted sm:block">
            {isEdit ? 'Changes go live immediately.' : 'You can edit this after publishing.'}
          </p>
          <div className="flex gap-3">
            <button type="button" className="btn-outline" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button
              type="submit"
              form="project-form"
              className="btn-primary"
              disabled={saving}
            >
              {saving ? <Spinner size={15} /> : <Save size={15} />}
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create project'}
            </button>
          </div>
        </div>
      }
    >
      <form id="project-form" onSubmit={handleSubmit} noValidate className="space-y-5">
        {serverError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
            {serverError}
          </div>
        )}

        <div>
          <label htmlFor="project-title" className="field-label">
            Project title
          </label>
          <input
            id="project-title"
            value={values.title}
            onChange={set('title')}
            className={`input ${errors.title ? 'input-error' : ''}`}
            placeholder="Northstar Analytics"
            maxLength={120}
          />
          {errors.title && <p className="field-error">{errors.title}</p>}
        </div>

        <div>
          <label htmlFor="project-description" className="field-label">
            Description
          </label>
          <textarea
            id="project-description"
            rows={5}
            value={values.description}
            onChange={set('description')}
            className={`input resize-y ${errors.description ? 'input-error' : ''}`}
            placeholder="What was the problem, what did you make, and what changed?"
            maxLength={5000}
          />
          <div className="mt-1.5 flex justify-between">
            {errors.description ? (
              <p className="field-error !mt-0">{errors.description}</p>
            ) : (
              <p className="text-xs text-muted">This appears on the project card and detail page.</p>
            )}
            <span className="font-mono text-[0.55rem] uppercase tracking-[0.1em] text-muted">
              {values.description.length} / 5000
            </span>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="project-year" className="field-label">
              Year
            </label>
            <input
              id="project-year"
              value={values.year}
              onChange={set('year')}
              className="input"
              placeholder="2026"
              maxLength={12}
            />
          </div>
          <div>
            <label htmlFor="project-accent" className="field-label">
              Artwork accent
            </label>
            <div className="relative">
              <span
                className={`pointer-events-none absolute left-4 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full ${
                  ACCENTS.find((item) => item.value === values.accent)?.color || 'bg-terracotta'
                }`}
              />
              <select
                id="project-accent"
                value={values.accent}
                onChange={set('accent')}
                className="input appearance-none !pl-10"
              >
                {ACCENTS.map((accent) => (
                  <option key={accent.value} value={accent.value}>
                    {accent.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="project-tech" className="field-label">
            Tech stack
          </label>
          <input
            id="project-tech"
            value={values.techStack}
            onChange={set('techStack')}
            className="input"
            placeholder="React, Node.js, MongoDB"
          />
          <p className="mt-1.5 text-xs text-muted">Separate each technology with a comma.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="project-image" className="field-label">
              Image URL <span className="font-normal text-muted">(optional)</span>
            </label>
            <input
              id="project-image"
              value={values.imageUrl}
              onChange={set('imageUrl')}
              className={`input ${errors.imageUrl ? 'input-error' : ''}`}
              placeholder="https://…"
            />
            {errors.imageUrl && <p className="field-error">{errors.imageUrl}</p>}
          </div>
          <div>
            <label htmlFor="project-live" className="field-label">
              Live URL <span className="font-normal text-muted">(optional)</span>
            </label>
            <input
              id="project-live"
              value={values.liveUrl}
              onChange={set('liveUrl')}
              className={`input ${errors.liveUrl ? 'input-error' : ''}`}
              placeholder="https://…"
            />
            {errors.liveUrl && <p className="field-error">{errors.liveUrl}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="project-repo" className="field-label">
            Repository URL <span className="font-normal text-muted">(optional)</span>
          </label>
          <input
            id="project-repo"
            value={values.repoUrl}
            onChange={set('repoUrl')}
            className={`input ${errors.repoUrl ? 'input-error' : ''}`}
            placeholder="https://github.com/…"
          />
          {errors.repoUrl && <p className="field-error">{errors.repoUrl}</p>}
        </div>

        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-line bg-cream/55 px-4 py-3.5">
          <span>
            <span className="block text-sm font-medium">Feature on the homepage</span>
            <span className="mt-0.5 block text-xs text-muted">
              Featured projects are pinned first in the portfolio.
            </span>
          </span>
          <span className="relative inline-flex shrink-0 items-center">
            <input
              type="checkbox"
              checked={values.featured}
              onChange={set('featured')}
              className="peer sr-only"
            />
            <span className="h-6 w-11 rounded-full bg-line transition peer-checked:bg-forest peer-focus-visible:ring-2 peer-focus-visible:ring-terracotta peer-focus-visible:ring-offset-2" />
            <span className="absolute left-1 h-4 w-4 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
          </span>
        </label>
      </form>
    </Modal>
  );
}
