import { User, FolderGit2, BadgeCheck } from 'lucide-react'

const navItems = [
    { icon: User, label: 'About Me', href: '#hero' },
    { icon: FolderGit2, label: 'Repositories', href: '#projects' },
    { icon: BadgeCheck, label: 'Certifications', href: '#certs' },
]

const Navbar = () => {
    const scrollTo = (href) => {
        const el = document.querySelector(href)
        if (!el) return
        const navbarOffset = 80
        const y = el.getBoundingClientRect().top + window.scrollY - navbarOffset
        const start = window.scrollY
        const distance = y - start
        const duration = 600
        let startTime = null

        const step = (timestamp) => {
            if (!startTime) startTime = timestamp
            const progress = Math.min((timestamp - startTime) / duration, 1)
            const ease = 1 - Math.pow(1 - progress, 3)
            window.scrollTo(0, start + distance * ease)
            if (progress < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
    }

    return (
        <nav className="sticky top-4 z-50 flex justify-center w-full mb-4">
            <ul className="glass menu menu-horizontal bg-white/10 backdrop-blur-md border border-white/15 rounded-full items-center gap-2 px-4 py-2">
                {navItems.map(({ icon: Icon, label, href }) => (
                    <li key={label}>
                        <a className="tooltip" data-tip={label} href={href} onClick={(e) => { e.preventDefault(); scrollTo(href) }}>
                            <Icon size={20} />
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default Navbar;
