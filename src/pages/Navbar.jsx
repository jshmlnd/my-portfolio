import { User, FolderGit2, BadgeCheck } from 'lucide-react'

const navItems = [
    { icon: User, label: 'About Me', href: '#hero' },
    { icon: FolderGit2, label: 'Repositories', href: '#projects' },
    { icon: BadgeCheck, label: 'Certifications', href: '#certs' },
]

const Navbar = () => {
    return (
        <nav className="sticky top-4 z-50 flex justify-center w-full mb-4">
            <ul className="glass menu menu-horizontal bg-white/10 backdrop-blur-md border border-white/15 rounded-full items-center gap-2 px-4 py-2">
                {navItems.map(({ icon: Icon, label, href }) => (
                    <li key={label} to>
                        <a className="tooltip" data-tip={label} href={href}>
                            <Icon size={20} />
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default Navbar;
