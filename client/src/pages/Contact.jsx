import { useState } from 'react';
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Send,
} from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { firstError } from '../utils/format';
import { Spinner } from '../components/Feedback';

const INITIAL = { name: '', email: '', message: '' };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Contact() {
  useDocumentTitle('Contact');

  const { notify } = useToast();
  const [values, setValues] = useState(INITIAL);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [sent, setSent] = useState(false);

  const update = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    if (fieldErrors[field]) {
      setFieldErrors((current) => ({ ...current, [field]: '' }));
    }
    if (serverError) setServerError('');
  };

  const validate = () => {
    const next = {};
    if (!values.name.trim()) next.name = 'Tell me your name.';
    if (!values.email.trim()) next.email = 'An email address is required.';
    else if (!EMAIL_PATTERN.test(values.email.trim()))
      next.email = 'That email address doesn’t look right.';
    if (!values.message.trim()) next.message = 'A message is required.';
    else if (values.message.trim().length < 10)
      next.message = 'A little more detail would help (at least 10 characters).';
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      await api.contact.send({
        name: values.name.trim(),
        email: values.email.trim(),
        message: values.message.trim(),
      });
      setSent(true);
      setValues(INITIAL);
      notify('Message sent. I’ll be in touch soon.', 'success');
    } catch (error) {
      setServerError(firstError(error));
      if (error.errors?.length) {
        const next = {};
        error.errors.forEach((item) => {
          next[item.field] = item.message;
        });
        setFieldErrors(next);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="relative overflow-hidden pb-16 pt-32 sm:pt-40">
        <div
          className="pointer-events-none absolute -right-20 top-24 h-80 w-80 rounded-full bg-terracotta/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="container-editorial relative">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-6">
              <p className="eyebrow flex items-center gap-3">
                <span className="h-px w-8 bg-terracotta" />
                03 / Contact
              </p>
              <h1 className="mt-6 font-display text-[clamp(3.2rem,7vw,6.4rem)] font-light leading-[0.92] tracking-[-0.05em]">
                Let’s make
                <span className="block italic text-terracotta">something good.</span>
              </h1>
              <p className="mt-7 max-w-lg text-pretty text-[1.03rem] leading-relaxed text-muted">
                Have a product that needs shaping, a site that needs building, or a problem
                that needs a second pair of eyes? Tell me a little about it. I read every
                message myself.
              </p>

              <div className="mt-9 space-y-3">
                <a
                  href="mailto:hello@alexchen.dev"
                  className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-cream/60 px-5 py-4 transition hover:border-ink hover:bg-cream"
                >
                  <span className="flex items-center gap-3">
                    <Mail size={17} className="text-terracotta" />
                    <span>
                      <span className="block text-[0.68rem] uppercase tracking-[0.12em] text-muted">
                        Email
                      </span>
                      <span className="text-sm font-medium">hello@alexchen.dev</span>
                    </span>
                  </span>
                  <ArrowUpRight size={16} className="text-muted" />
                </a>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-line bg-cream/60 px-5 py-4">
                    <MapPin size={17} className="text-terracotta" />
                    <p className="mt-3 text-[0.68rem] uppercase tracking-[0.12em] text-muted">
                      Based in
                    </p>
                    <p className="mt-1 text-sm font-medium">Singapore</p>
                  </div>
                  <div className="rounded-2xl border border-line bg-cream/60 px-5 py-4">
                    <Clock3 size={17} className="text-terracotta" />
                    <p className="mt-3 text-[0.68rem] uppercase tracking-[0.12em] text-muted">
                      Replies in
                    </p>
                    <p className="mt-1 text-sm font-medium">1–2 working days</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-4">
                <span className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-muted">
                  Elsewhere
                </span>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="icon-btn"
                  aria-label="GitHub"
                >
                  <Github size={15} />
                </a>
                <a
                  href="https://www.linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="icon-btn"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={15} />
                </a>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative overflow-hidden rounded-[1.8rem] border border-line bg-cream/75 p-6 shadow-soft sm:p-8">
                <div className="absolute right-0 top-0 h-28 w-28 rounded-bl-[5rem] bg-butter/45" />
                {sent ? (
                  <div className="relative flex min-h-[28rem] flex-col items-center justify-center text-center">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-forest text-cream">
                      <CheckCircle2 size={28} />
                    </span>
                    <h2 className="mt-6 font-display text-4xl font-light tracking-[-0.035em]">
                      Message received.
                    </h2>
                    <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
                      Thanks for taking the time to write. I’ll read it properly and get back
                      to you within one or two working days.
                    </p>
                    <button type="button" onClick={() => setSent(false)} className="btn-outline mt-7">
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate className="relative">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="eyebrow">Start here</p>
                        <h2 className="mt-2 font-display text-3xl tracking-[-0.03em]">
                          Tell me about it.
                        </h2>
                      </div>
                      <span className="chip hidden sm:inline-flex">Usually replies in 1–2 days</span>
                    </div>

                    {serverError && (
                      <div
                        className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                        role="alert"
                      >
                        {serverError}
                      </div>
                    )}

                    <div className="mt-7 grid gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="contact-name" className="field-label">
                          Your name
                        </label>
                        <input
                          id="contact-name"
                          name="name"
                          type="text"
                          autoComplete="name"
                          value={values.name}
                          onChange={update('name')}
                          placeholder="Jordan Lee"
                          className={`input ${fieldErrors.name ? 'input-error' : ''}`}
                          aria-invalid={Boolean(fieldErrors.name)}
                          aria-describedby={fieldErrors.name ? 'contact-name-error' : undefined}
                        />
                        {fieldErrors.name && (
                          <p id="contact-name-error" className="field-error">
                            {fieldErrors.name}
                          </p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="contact-email" className="field-label">
                          Email address
                        </label>
                        <input
                          id="contact-email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          value={values.email}
                          onChange={update('email')}
                          placeholder="you@company.com"
                          className={`input ${fieldErrors.email ? 'input-error' : ''}`}
                          aria-invalid={Boolean(fieldErrors.email)}
                          aria-describedby={fieldErrors.email ? 'contact-email-error' : undefined}
                        />
                        {fieldErrors.email && (
                          <p id="contact-email-error" className="field-error">
                            {fieldErrors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-5">
                      <label htmlFor="contact-message" className="field-label">
                        What are you working on?
                      </label>
                      <textarea
                        id="contact-message"
                        name="message"
                        rows={7}
                        value={values.message}
                        onChange={update('message')}
                        placeholder="A little context, the shape of the problem, and what a good outcome would look like…"
                        className={`input resize-y ${fieldErrors.message ? 'input-error' : ''}`}
                        aria-invalid={Boolean(fieldErrors.message)}
                        aria-describedby={
                          fieldErrors.message ? 'contact-message-error' : 'contact-message-hint'
                        }
                      />
                      <div className="mt-1.5 flex items-start justify-between gap-4">
                        {fieldErrors.message ? (
                          <p id="contact-message-error" className="field-error !mt-0">
                            {fieldErrors.message}
                          </p>
                        ) : (
                          <p id="contact-message-hint" className="text-xs text-muted">
                            Links to a brief or a current site are welcome.
                          </p>
                        )}
                        <span className="font-mono text-[0.56rem] uppercase tracking-[0.1em] text-muted">
                          {values.message.length} / 3000
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col-reverse items-start justify-between gap-4 border-t border-line pt-5 sm:flex-row sm:items-center">
                      <p className="text-[0.7rem] leading-relaxed text-muted">
                        Your details are only used to reply. No lists, no noise.
                      </p>
                      <button type="submit" disabled={submitting} className="btn-primary shrink-0">
                        {submitting ? <Spinner size={16} /> : <Send size={15} />}
                        {submitting ? 'Sending…' : 'Send message'}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              <div className="mt-5 rounded-[1.8rem] bg-forest p-6 text-cream sm:p-7">
                <div className="flex items-start gap-4">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream/10">
                    <Clock3 size={17} />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 animate-pulseSoft rounded-full bg-[#b8d0a9]" />
                      <p className="font-mono text-[0.56rem] uppercase tracking-[0.16em] text-cream/55">
                        Currently booking
                      </p>
                    </div>
                    <p className="mt-2 font-display text-2xl tracking-[-0.02em]">
                      Select projects for winter 2026.
                    </p>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-cream/60">
                      I take on a small number of collaborations at a time so each one gets
                      proper attention. If the timing is tight, say so — I’ll be honest about
                      what’s possible.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-cream/55 py-14">
        <div className="container-editorial grid gap-8 sm:grid-cols-3">
          {[
            {
              title: 'A good brief',
              copy: 'A sentence about the problem, who it is for, and what success looks like. Rough is fine.',
            },
            {
              title: 'Honest timing',
              copy: 'Tell me your dates and constraints early. I would rather shape a smaller scope than miss a deadline.',
            },
            {
              title: 'The right fit',
              copy: 'If I am not the best person for the work, I will say so and point you toward someone who is.',
            },
          ].map((item, index) => (
            <div key={item.title} className="border-t border-ink/15 pt-5">
              <span className="font-mono text-[0.58rem] tracking-[0.14em] text-terracotta">
                0{index + 1}
              </span>
              <h2 className="mt-3 font-display text-xl tracking-[-0.02em]">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.copy}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
