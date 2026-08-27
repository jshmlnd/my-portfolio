import { useState, useEffect } from 'react';
import { User, FolderGit2, BadgeCheck } from 'lucide-react';

const navItems = [
    { icon: User, label: 'About Me', href: '#hero', id: 'hero' },
    { icon: FolderGit2, label: 'Repositories', href: '#projects', id: 'projects' },
    { icon: BadgeCheck, label: 'Certifications', href: '#certs', id: 'certs' },
];

const Navbar = () => {
    const [active, setActive] = useState('hero');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        const sections = navItems.map((item) => document.getElementById(item.id));
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActive(entry.target.id);
                    }
                });
            },
            { rootMargin: '-20% 0px -60% 0px' }
        );

        sections.forEach((section) => {
            if (section) observer.observe(section);
        });

        return () => observer.disconnect();
    }, []);

    const scrollTo = (href) => {
        const el = document.querySelector(href);
        if (!el) return;
        const navbarOffset = 80;
        const y = el.getBoundingClientRect().top + window.scrollY - navbarOffset;
        const start = window.scrollY;
        const distance = y - start;
        const duration = 600;
        let startTime = null;

        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            window.scrollTo(0, start + distance * ease);
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };

    return (
        <nav className={`sticky top-9 z-50 flex justify-center w-full mb-4 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <ul className="glass menu menu-horizontal bg-white/10 backdrop-blur-md border border-white/15 rounded-full items-center gap-2 px-4 py-2 shadow-lg shadow-black/20">
                {navItems.map(({ icon: Icon, label, href, id }) => (
                    <li key={label}>
                        <a
                            className={`tooltip flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 ${
                                active === id
                                    ? 'bg-[#89dceb]/15 text-[#89dceb] shadow-[0_0_12px_rgba(137,220,235,0.15)]'
                                    : 'text-[#bac2de] hover:text-[#89dceb] hover:bg-white/5'
                            }`}
                            data-tip={label}
                            href={href}
                            onClick={(e) => {
                                e.preventDefault();
                                scrollTo(href);
                            }}
                        >
                            <Icon size={20} className={`transition-transform duration-300 ${active === id ? 'scale-110' : ''}`} />
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default Navbar;
