import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { GitCommitHorizontal, File, FolderGit, Copy, Check } from 'lucide-react';
import { SiReact, SiTailwindcss, SiDaisyui, SiNodedotjs, SiMongodb, SiExpress, SiSocketdotio, SiAxios, SiVercel, SiAnilist } from "react-icons/si";

const projects = {
    counseling: {
        name: 'University Mental Health Support System',
        role: 'Full Stack Developer',
        url: 'https://ust-legazpi-mhss.onrender.com',
        frontend: [
            { icon: <SiReact size="18px" />, label: 'React' },
            { icon: <SiTailwindcss size="18px" />, label: 'Tailwind CSS' },
            { icon: <SiDaisyui size="18px" />, label: 'DaisyUI' },
        ],
        backend: [
            { icon: <SiNodedotjs size="18px" />, label: 'Node.js' },
            { icon: <SiMongodb size="18px" />, label: 'MongoDB' },
            { icon: <SiExpress size="18px" />, label: 'Express' },
            { icon: <SiSocketdotio size="18px" />, label: 'Socket.io' },
        ],
        description: 'A web application designed to assist university students with counseling services and academic guidance. Showcasing my full stack development skills, the project features a tech-bio UI. The backend is built with Node.js, Express, and MongoDB, while the frontend is developed using React, Tailwind CSS, and DaisyUI. The application also incorporates real-time communication using Socket.io and Agora for seamless interaction between students and counselors.',
    },
    portfolio: {
        name: 'Personal Portfolio Website',
        role: 'Frontend Developer',
        url: 'https://my-portfolio-tau-six-64.vercel.app/',
        frontend: [
            { icon: <SiReact size="18px" />, label: 'React' },
            { icon: <SiTailwindcss size="18px" />, label: 'Tailwind CSS' },
            { icon: <SiDaisyui size="18px" />, label: 'DaisyUI' },
        ],
        backend: '',
        description: 'A personal portfolio website showcasing my front end developing skills, featuring a unique design and smooth user experience.',
    },
    animei: {
        name: 'Animei: Free Anime Streaming Website',
        role: 'Full Stack Developer',
        url: 'https://animei-snowy.vercel.app/',
        frontend: [
            { icon: <SiReact size="18px" />, label: 'React' },
            { icon: <SiTailwindcss size="18px" />, label: 'Tailwind CSS' },
            { icon: <SiDaisyui size="18px" />, label: 'DaisyUI' },
            { icon: <SiAnilist size="18px" />, label: 'AniList API' },
        ],
        backend: [
            { icon: <SiAxios size="18px" />, label: 'Axios' },
            { icon: <SiVercel size="18px" />, label: 'Vercel Serverless Function' },
        ],
        description: 'A free anime streaming website, built using React to showcase advanced web development skills. The project features a modern UI and seamless user experience. Built with love for my Jimei. 🩷',
    },
};

const README_URL = 'https://raw.githubusercontent.com/jshmlnd/.github/main/profile/README.md';

const LoadingSkeleton = () => (
    <div className='flex flex-col gap-3 animate-pulse'>
        <div className='h-6 bg-[#313244] rounded w-3/4'></div>
        <div className='h-4 bg-[#313244] rounded w-1/4'></div>
        <div className='flex gap-4 mt-2'>
            <div className='h-4 bg-[#313244] rounded w-1/3'></div>
            <div className='h-4 bg-[#313244] rounded w-1/4'></div>
        </div>
        <div className='h-4 bg-[#313244] rounded w-full mt-2'></div>
        <div className='h-4 bg-[#313244] rounded w-5/6'></div>
    </div>
);

const MainContent = () => {
    const [selected, setSelected] = useState(null);
    const [readmeContent, setReadmeContent] = useState('');
    const [readmeLoading, setReadmeLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const text = activeProject?.url || activeProject?.name || '';
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const activeProject = selected ? projects[selected] : null;

    useEffect(() => {
        if (selected === 'readme' && !readmeContent) {
            setReadmeLoading(true);
            fetch(README_URL)
                .then((res) => {
                    if (!res.ok) throw new Error('Failed to fetch');
                    return res.text();
                })
                .then((md) => setReadmeContent(md))
                .catch(() => setReadmeContent('# Error\nFailed to load README.md'))
                .finally(() => setReadmeLoading(false));
        }
    }, [selected, readmeContent]);

    return (
        <section id='projects' className='bg-[#0d0221] px-6 py-16'>
            <div className='max-w-6xl mx-auto flex flex-col gap-12'>
                <h2 className='text-4xl sm:text-5xl font-black text-white uppercase tracking-tighter'>
                    Projects
                </h2>

                <div className='flex flex-col lg:flex-row gap-8'>
                    <aside className='lg:w-70'>
                        <ul className="menu menu-xs bg-[#1e1e2e] border border-[#313244] rounded-box w-full">
                            <li>
                                <details open>
                                    <summary>
                                        <GitCommitHorizontal size={14} />
                                        Repositories
                                    </summary>
                                    <ul>
                                        <li className={selected === 'counseling' ? 'active' : ''}>
                                            <a onClick={() => setSelected('counseling')}>
                                                <FolderGit size={14} />
                                                jshmlnd/ust-legazpi-mhss
                                            </a>
                                        </li>
                                        <li className={selected === 'portfolio' ? 'active' : ''}>
                                            <a onClick={() => setSelected('portfolio')}>
                                                <FolderGit size={14} />
                                                jshmlnd/my-portfolio
                                            </a>
                                        </li>
                                        <li className={selected === 'animei' ? 'active' : ''}>
                                            <a onClick={() => setSelected('animei')}>
                                                <FolderGit size={14} />
                                                jshmlnd/ani-mei
                                            </a>
                                        </li>
                                    </ul>
                                </details>
                            </li>
                        </ul>
                    </aside>

                    <div className='flex-1 flex flex-col gap-6 min-w-0'>
                        {activeProject && activeProject.name !== 'README.md' && (
                            <div className='flex flex-col gap-3 text-[#cdd6f4]'>
                                <h3 className='text-2xl font-bold'>{activeProject.name}</h3>
                                {activeProject.role && (
                                    <>
                                        <div className='sm:flex-row'>
                                            <span className='text-[#6c7086] text-sm'>Role</span>
                                            <p className='text-lg text-[#a6e3a1] font-semibold'>{activeProject.role}</p>
                                        </div>
                                    </>
                                )}
                                <div className='flex flex-col sm:flex-row gap-7 text-sm'>
                                    {activeProject.frontend && (
                                        <div>
                                            <span className='text-[#6c7086]'>Frontend Stack</span>
                                            <div className='flex flex-wrap items-center gap-3 mt-1 text-[#89dceb]'>
                                                {activeProject.frontend.map(({ icon, label }) => (
                                                    <span key={label} className='flex items-center gap-1.5'>
                                                        {icon}
                                                        <span className='font-semibold'>{label}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {activeProject.backend && (
                                        <div>
                                            <span className='text-[#6c7086]'>Backend</span>
                                            <div className='flex flex-wrap items-center gap-3 mt-1 text-[#89dceb]'>
                                                {activeProject.backend.map(({ icon, label }) => (
                                                    <span key={label} className='flex items-center gap-1.5'>
                                                        {icon}
                                                        <span className='font-semibold'>{label}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {activeProject.description && (
                                    <p className='text-sm text-[#bac2de] leading-relaxed'>{activeProject.description}</p>
                                )}
                            </div>
                        )}

                        <div className="mockup-browser border border-[#313244] bg-[#1e1e2e] rounded-2xl flex flex-col min-h-[500px]">
                            <div className="mockup-browser-toolbar pb-2.5 border-b border-[#313244]">
                                <div className="input text-sm flex items-center justify-between">
                                    <span className="truncate">
                                        {activeProject ? activeProject.url || activeProject.name : 'Select a project...'}
                                    </span>
                                    {activeProject && (
                                        <button
                                            onClick={handleCopy}
                                            className="ml-2 p-1 rounded hover:bg-[#313244] transition-colors text-[#6c7086] hover:text-[#cdd6f4]"
                                            title="Copy to clipboard"
                                        >
                                            {copied ? <Check size={14} className="text-[#a6e3a1]" /> : <Copy size={14} />}
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto markdown-body-container">
                                {selected === 'readme' ? (
                                    readmeLoading ? (
                                        <LoadingSkeleton />
                                    ) : (
                                        <article className="markdown-body">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {readmeContent}
                                            </ReactMarkdown>
                                        </article>
                                    )
                                ) : activeProject && activeProject.url ? (
                                    <iframe
                                        src={activeProject.url}
                                        className="w-full h-full border-0"
                                        title={activeProject.name}
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-[#6c7086]">
                                        {selected ? 'Preview not available' : 'Click a project to preview'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MainContent;
