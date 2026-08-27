import { siGithub, siFacebook } from "simple-icons";

const socialLinks = [
    { icon: siGithub, url: 'https://www.github.com/jshmlnd', label: 'GitHub' },
    { icon: siFacebook, url: 'https://www.facebook.com/jkmalonda', label: 'Facebook' },
];

const Footer = () => {
    return (
        <footer className="bg-[#111111] border-t border-[#313244]">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-6">
                <div className="flex items-center gap-3">
                    <svg role="img" viewBox="0 0 24 24" width="28" height="28" fill="currentColor" className="text-[#6c7086]">
                        <path d={siGithub.path} />
                    </svg>
                    <p className="text-sm text-[#6c7086]">
                        &copy; {new Date().getFullYear()}{' '}
                        <a
                            href="https://github.com/jshmlnd/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#bac2de] hover:text-[#89dceb] transition-colors duration-200"
                        >
                            @jshmlnd
                        </a>
                        {' '}&mdash; All rights reserved
                    </p>
                </div>

                <nav className="flex items-center gap-3">
                    {socialLinks.map(({ icon, url, label }) => (
                        <a
                            key={label}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={label}
                            className="p-2 rounded-lg text-[#6c7086] hover:text-[#89dceb] hover:bg-[#89dceb]/10 transition-all duration-300 hover:shadow-[0_0_12px_rgba(137,220,235,0.15)]"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d={icon.path} />
                            </svg>
                        </a>
                    ))}
                </nav>
            </div>
        </footer>
    );
};

export default Footer;
