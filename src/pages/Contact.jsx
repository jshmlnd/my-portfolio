import { useEffect, useRef, useState } from 'react';
import { useReveal } from '../hooks/useReveal';
import { getTurnstileToken } from '../utils/turnstile';
import { Send, Mail, User, Briefcase, MessageSquare, CheckCircle } from 'lucide-react';

const TURNSTILE_SITEKEY = '0x4AAAAAAFeCX2XX6gNaahsr';
const TURNSTILE_VERIFY_ENDPOINT = '/api/contact';
const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';
const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || '';

const Contact = () => {
  const revealRef = useReveal();
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [errorDetail, setErrorDetail] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileRef = useRef(null);
  const widgetIdRef = useRef(null);

  useEffect(() => {
    const renderWidget = () => {
      if (!turnstileRef.current || !window.turnstile || widgetIdRef.current !== null) return;
      widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
        sitekey: TURNSTILE_SITEKEY,
        action: 'contact',
        callback: setTurnstileToken,
        'expired-callback': () => setTurnstileToken(''),
        'error-callback': () => {
          setTurnstileToken('');
          setStatus('error');
        },
      });
    };

    let script = document.querySelector('script[data-turnstile]');
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.dataset.turnstile = 'true';
      document.head.appendChild(script);
    }

    script.addEventListener('load', renderWidget);
    renderWidget();

    return () => {
      script.removeEventListener('load', renderWidget);
      if (widgetIdRef.current !== null && window.turnstile?.remove) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = null;
    };
  }, []);

  const resetTurnstile = () => {
    setTurnstileToken('');
    if (widgetIdRef.current !== null) window.turnstile?.reset(widgetIdRef.current);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getTurnstileToken(window.turnstile, widgetIdRef.current, turnstileToken);
    if (!token) {
      setErrorDetail('Please complete the verification check');
      setStatus('error');
      return;
    }
    setStatus('sending');
    setErrorDetail('');

    const form = e.target;
    const formData = new FormData(form);
    formData.set('subject', `New Project Inquiry from ${formData.get('name')}`);
    formData.set('from_name', 'Personal Portfolio Form');

    try {
      const verification = new FormData();
      verification.set('cf-turnstile-response', token);
      const verificationResponse = await fetch(TURNSTILE_VERIFY_ENDPOINT, {
        method: 'POST',
        body: verification,
      });
      if (!verificationResponse.ok) {
        setErrorDetail('Bot verification failed');
        setStatus('error');
        return;
      }
      if (!WEB3FORMS_ACCESS_KEY) {
        setErrorDetail('Web3Forms is not configured for this build');
        setStatus('error');
        return;
      }

      formData.set('access_key', WEB3FORMS_ACCESS_KEY);
      formData.delete('botcheck');
      formData.delete('cf-turnstile-response');
      const response = await fetch(WEB3FORMS_ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData,
      });

      const data = await response.json().catch(() => ({ success: false }));
      if (data.success === true) {
        setStatus('sent');
        form.reset();
      } else {
        setErrorDetail(data.message || data.body?.message || 'The message could not be delivered');
        setStatus('error');
      }
    } catch {
      setErrorDetail('The message could not be delivered');
      setStatus('error');
    } finally {
      resetTurnstile();
    }
  };


  return (
    <section id="contact" className="bg-[#09090b] border-t border-[#1f1f23] px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
      <div className="max-w-[1160px] w-full mx-auto flex flex-col gap-8 sm:gap-10 reveal" ref={revealRef}>
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3">
            <p className="mono-label">06 — Get in Touch</p>
            <h2 className="text-[32px] sm:text-[40px] font-black tracking-[-0.03em] leading-none text-white">
              Let's Build <span className="text-zinc-500">Together.</span>
            </h2>
            <p className="max-w-[560px] text-[14px] leading-6 text-zinc-400">
              Have a project in mind? I'm always open to discussing new opportunities, creative ideas, or ways to bring your vision to life.
            </p>
          </div>
          <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-[#27272a] bg-[#0f0f10] px-3 py-1.5 font-mono text-[11px] tracking-wide text-zinc-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Open to internships · 2027
          </div>
        </div>

        {/* Form Card */}
        <div className="relative overflow-hidden rounded-2xl border border-[#27272a] bg-[#0f0f10]">
          <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-sky-500/5 pointer-events-none" />

          <div className="relative p-4 sm:p-6 lg:p-10">
            {status === 'sent' ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-xl font-semibold text-white">Message Sent!</h3>
                <p className="text-sm text-zinc-400 max-w-[400px]">
                  Thanks for reaching out. I'll get back to you within 24-48 hours.
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="mt-4 font-mono text-[11px] tracking-widest uppercase text-zinc-500 hover:text-white transition-colors"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                 <input type="hidden" name="subject" value="New Project Inquiry from Portfolio" />
                <input type="hidden" name="from_name" value="Personal Portfolio Form" />
                {/* Honeypot spam protection */}
                <input type="checkbox" name="botcheck" className="hidden" style={{ display: 'none' }} />

                {/* Name */}
                <div className="space-y-2 min-w-0">
                  <label htmlFor="name" className="flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase text-zinc-500 sm:text-[11px]">
                    <User className="w-3.5 h-3.5" />
                    Name / Company *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    placeholder="Name / Company"
                    className="w-full px-4 py-3 rounded-lg border border-[#27272a] bg-[#141416] text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-[#3f3f46] focus:bg-[#18181b] transition-colors"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2 min-w-0">
                  <label htmlFor="email" className="flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase text-zinc-500 sm:text-[11px]">
                    <Mail className="w-3.5 h-3.5" />
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    placeholder="@example.com"
                    className="w-full px-4 py-3 rounded-lg border border-[#27272a] bg-[#141416] text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-[#3f3f46] focus:bg-[#18181b] transition-colors"
                  />
                </div>

                {/* Project Type */}
                 <div className="space-y-2 min-w-0 md:col-span-2">
                  <label htmlFor="projectType" className="flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase text-zinc-500 sm:text-[11px]">
                    <Briefcase className="w-3.5 h-3.5" />
                    Project Type *
                  </label>
                  <select
                    id="projectType"
                    name="projectType"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-[#27272a] bg-[#141416] text-white text-sm focus:outline-none focus:border-[#3f3f46] focus:bg-[#18181b] transition-colors appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select project type</option>
                    <option value="Web-Application">Web Application</option>
                    <option value="Mobile-App">Mobile App</option>
                    <option value="Full-Stack">Full-Stack Project</option>
                    <option value="API/Backend">API / Backend</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Other">Other</option>
                  </select>
                 </div>

                <div className="md:col-span-2 min-h-[65px]" aria-label="Bot verification">
                  <div ref={turnstileRef} />
                </div>

                {/* Message */}
                <div className="space-y-2 min-w-0 md:col-span-2">
                  <label htmlFor="message" className="flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase text-zinc-500 sm:text-[11px]">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    placeholder="Tell me about your project, timeline, and budget..."
                    className="w-full px-4 py-3 rounded-lg border border-[#27272a] bg-[#141416] text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-[#3f3f46] focus:bg-[#18181b] transition-colors resize-none"
                  />
                </div>

                {/* Submit */}
                <div className="md:col-span-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
                  <p className="font-mono text-[10px] text-zinc-600 sm:text-[11px]">
                    * I typically respond within 24-48 hours
                  </p>
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="inline-flex w-full items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
                  >
                    {status === 'sending' ? (
                      <>
                        <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {status === 'error' && (
              <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                {errorDetail}. Please try again or email me directly at{' '}
                <a href="mailto:joshua.malonda11@gmail.com" className="underline hover:text-red-300">
                  joshua.malonda11@gmail.com
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
