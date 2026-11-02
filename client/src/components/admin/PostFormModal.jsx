import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import Modal from '../Modal';
import { Spinner } from '../Feedback';
import { api } from '../../api/client';
import { firstError } from '../../utils/format';

const blankPost = () => ({
  title: '',
  excerpt: '',
  content: '',
  coverImage: '',
  tags: '',
  featured: false,
});

export default function PostFormModal({ open, post, token, onClose, onSaved }) {
  const isEdit = Boolean(post?._id);
  const [values, setValues] = useState(blankPost);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (post) {
      setValues({
        title: post.title || '',
        excerpt: post.excerpt || '',
        content: post.content || '',
        coverImage: post.coverImage || '',
        tags: (post.tags || []).join(', '),
        featured: Boolean(post.featured),
      });
    } else {
      setValues(blankPost());
    }
    setErrors({});
    setServerError('');
    setSaving(false);
  }, [open, post]);

  const set = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setValues((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: '' }));
    if (serverError) setServerError('');
  };

  const validate = () => {
    const next = {};
    if (!values.title.trim()) next.title = 'A title is required.';
    if (!values.content.trim()) next.content = 'The post needs some content.';
    else if (values.content.trim().length < 20)
      next.content = 'Write at least a couple of sentences.';
    if (values.coverImage.trim() && !/^(https?:\/\/|\/)/i.test(values.coverImage.trim())) {
      next.coverImage = 'Use a full URL starting with https:// or a path starting with /.';
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
      excerpt: values.excerpt.trim(),
      content: values.content.trim(),
      coverImage: values.coverImage.trim(),
      tags: values.tags
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      featured: values.featured,
    };

    try {
      const saved = isEdit
        ? await api.blog.update(post._id, payload, token)
        : await api.blog.create(payload, token);
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
      title={isEdit ? 'Edit journal note' : 'Write a journal note'}
      description={
        isEdit
          ? 'Refine the writing and update the published note.'
          : 'Markdown is supported: headings, lists, links, quotes, and code.'
      }
      size="lg"
      footer={
        <div className="flex items-center justify-between gap-4">
          <p className="hidden text-xs text-muted sm:block">
            {values.content.trim()
              ? `${values.content.trim().split(/\s+/).filter(Boolean).length} words`
              : 'A blank page is a fine place to start.'}
          </p>
          <div className="flex gap-3">
            <button type="button" className="btn-outline" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" form="post-form" className="btn-primary" disabled={saving}>
              {saving ? <Spinner size={15} /> : <Save size={15} />}
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Publish note'}
            </button>
          </div>
        </div>
      }
    >
      <form id="post-form" onSubmit={handleSubmit} noValidate className="space-y-5">
        {serverError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
            {serverError}
          </div>
        )}

        <div>
          <label htmlFor="post-title" className="field-label">
            Title
          </label>
          <input
            id="post-title"
            value={values.title}
            onChange={set('title')}
            className={`input ${errors.title ? 'input-error' : ''}`}
            placeholder="Designing for the in-between"
            maxLength={160}
          />
          {errors.title && <p className="field-error">{errors.title}</p>}
        </div>

        <div>
          <label htmlFor="post-excerpt" className="field-label">
            Excerpt <span className="font-normal text-muted">(optional)</span>
          </label>
          <textarea
            id="post-excerpt"
            rows={2}
            value={values.excerpt}
            onChange={set('excerpt')}
            className="input resize-y"
            placeholder="A short summary for the journal listing. Leave blank to generate one."
            maxLength={320}
          />
          <div className="mt-1.5 flex justify-between">
            <p className="text-xs text-muted">Shown on cards and in search results.</p>
            <span className="font-mono text-[0.55rem] uppercase tracking-[0.1em] text-muted">
              {values.excerpt.length} / 320
            </span>
          </div>
        </div>

        <div>
          <label htmlFor="post-content" className="field-label">
            Content
          </label>
          <textarea
            id="post-content"
            rows={12}
            value={values.content}
            onChange={set('content')}
            className={`input resize-y font-mono text-[0.82rem] leading-relaxed ${
              errors.content ? 'input-error' : ''
            }`}
            placeholder={'## A good place to start\n\nWrite the note here. Markdown is supported.'}
            maxLength={50000}
          />
          <div className="mt-1.5 flex justify-between">
            {errors.content ? (
              <p className="field-error !mt-0">{errors.content}</p>
            ) : (
              <p className="text-xs text-muted">## Heading, **bold**, lists, and links all work.</p>
            )}
            <span className="font-mono text-[0.55rem] uppercase tracking-[0.1em] text-muted">
              {values.content.length} / 50000
            </span>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="post-tags" className="field-label">
              Tags
            </label>
            <input
              id="post-tags"
              value={values.tags}
              onChange={set('tags')}
              className="input"
              placeholder="Design, Process"
            />
            <p className="mt-1.5 text-xs text-muted">Comma-separated, up to 30 characters each.</p>
          </div>
          <div>
            <label htmlFor="post-cover" className="field-label">
              Cover image <span className="font-normal text-muted">(optional)</span>
            </label>
            <input
              id="post-cover"
              value={values.coverImage}
              onChange={set('coverImage')}
              className={`input ${errors.coverImage ? 'input-error' : ''}`}
              placeholder="https://…"
            />
            {errors.coverImage && <p className="field-error">{errors.coverImage}</p>}
          </div>
        </div>

        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-line bg-cream/55 px-4 py-3.5">
          <span>
            <span className="block text-sm font-medium">Feature in the journal</span>
            <span className="mt-0.5 block text-xs text-muted">
              Featured notes appear first and get a larger card.
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
