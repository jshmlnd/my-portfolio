import React from "react";
import { siGithub, siFacebook } from "simple-icons";

const Footer = () => {
    return (
        <footer className="footer sm:footer-horizontal bg-neutral text-neutral-content items-center p-4">
            <aside className="grid-flow-col items-center">
                <svg role="img" viewBox="0 0 24 24" width="36" height="36" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d={siGithub.path} />
                </svg>
                <p>Copyright © {new Date().getFullYear()} by <a href="https://github.com/jshmlnd/">@jshmlnd</a> - All right reserved</p>
            </aside>
            <nav className="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
                <a href="https://www.github.com/jshmlnd" target="_blank" rel="noopener noreferrer">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="26"
                        height="26"
                        viewBox="0 0 24 24"
                        className="fill-current">
                        <path d={siGithub.path} />
                    </svg>
                </a>
                <a href="https://www.facebook.com/jkmalonda" target="_blank" rel="noopener noreferrer">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="26"
                        height="26"
                        viewBox="0 0 24 24"
                        className="fill-current">
                        <path d={siFacebook.path} />
                    </svg>
                </a>
            </nav>
        </footer>
    );
};

export default Footer;