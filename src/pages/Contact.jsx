import { useState } from 'react';
import { useReveal } from '../hooks/useReveal';
import { Send, Mail, User, Briefcase, MessageSquare, CheckCircle } from 'lucide-react';

const WEB3FORMS_ACCESS_KEY = 'c335c0d9-5bae-48ab-97df-e95d83ca11bf';

const Contact = () => {
  const revealRef = useReveal();
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');

    const form = e.target;
    const formData = new FormData(form);
    // access_key is already in the hidden input — don't append again
    formData.set('subject', `New Project Inquiry from ${formData.get('name')}`);
    formData.set('from_name', 'Personal Portfolio Form');

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setStatus('sent');
        form.reset();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };


  return (
    <section id="contact" className="bg-[#09090b] border-t border-[#1f1f23] px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
      <div className="max-w-[1160px] w-full mx-auto flex flex-col gap-8 sm:gap-10 reveal" ref={revealRef}>
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3">
            <p className="mono-label">04 — Get in Touch</p>
            <h2 className="text-[32px] sm:text-[40px] font-black tracking-[-0.03em] leading-none text-white">
              Let's Build <span className="text-zinc-500">Together.</span>
            </h2>
            <p className="max-w-[560px] text-[14px] leading-6 text-zinc-400">
              Have a project in mind? I'm always open to discussing new opportunities, creative ideas, or ways to bring your vision to life.
            </p>
          </div>
          <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-[#27272a] bg-[#0f0f10] px-3 py-1.5 font-mono text-[11px] tracking-wide text-zinc-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Available for projects
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
                {/* Web3Forms hidden fields */}
                <input type="hidden" name="access_key" value={WEB3FORMS_ACCESS_KEY} />
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
                Something went wrong. Please try again or email me directly at{' '}
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
