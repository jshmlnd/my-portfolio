import { useState, useEffect } from 'react';
import { siJavascript, siTypescript, siReact, siNextdotjs, siLua, siOpenjdk, siPython, siMongodb } from 'simple-icons';
import cv from '../assets/cv/Joshua_Klein_Malonda_Resume.pdf';

const terminalTitle = 'jshmlnd@jshmld-VirtualBox ~ zsh';
const terminal = terminalTitle.slice(0, 25);

const personalDetails = ["Joshua Klein A. Malonda", "BS Computer Science · Legazpi City, PH", "University of Santo Tomas - Legazpi"];
const techStack = [
    { name: 'JavaScript', icon: siJavascript },
    { name: 'TypeScript', icon: siTypescript },
    { name: 'React', icon: siReact },
    { name: 'Next.js', icon: siNextdotjs },
    { name: 'Lua', icon: siLua },
    { name: 'Java', icon: siOpenjdk },
    { name: 'Python', icon: siPython },
    { name: 'MongoDB', icon: siMongodb },
];

const commands = [
    { cmd: 'whoami', delay: 0 },
    { cmd: 'cat techstack.txt', delay: 1200 },
    { cmd: 'echo $STATUS', delay: 2400 },
];

const Hero = () => {
    const [visibleLines, setVisibleLines] = useState(0);
    const [typedCmd, setTypedCmd] = useState('');
    const [cmdIndex, setCmdIndex] = useState(0);

    useEffect(() => {
        if (cmdIndex >= commands.length) return;

        const { cmd, delay } = commands[cmdIndex];
        let charIndex = 0;
        let timeoutId;

        const typeNext = () => {
            if (charIndex <= cmd.length) {
                setTypedCmd(cmd.slice(0, charIndex));
                charIndex++;
                timeoutId = setTimeout(typeNext, 45 + Math.random() * 30);
            } else {
                timeoutId = setTimeout(() => {
                    setVisibleLines((prev) => prev + 1);
                    setTypedCmd('');
                    setCmdIndex((prev) => prev + 1);
                }, 400);
            }
        };

        timeoutId = setTimeout(typeNext, cmdIndex === 0 ? 600 : delay);
        return () => clearTimeout(timeoutId);
    }, [cmdIndex]);

    return (
        <section id='hero' className='relative min-h-screen flex flex-col items-center justify-center gap-12 px-6 overflow-hidden'>
            {/* Background radial glow */}
            <div className='absolute inset-0 pointer-events-none'>
                <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle,rgba(137,220,235,0.06)_0%,transparent_70%)]' />
                <div className='absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(203,166,247,0.04)_0%,transparent_70%)]' />
            </div>

            <h1 className='relative z-10 text-5xl sm:text-7xl lg:text-8xl font-black leading-tight tracking-wide text-center animate-fade-in-up'>
                <span className='gradient-text animate-gradient'>FULL STACK DEVELOPER</span>
                <br />
                <span className='text-white'>
                    {'JOSHUA KLEIN MALONDA'.split('').map((char, i) => (
                        <span
                            key={i}
                            className='animate-letter-reveal'
                            style={{ animationDelay: `${400 + i * 35}ms` }}
                        >
                            {char === ' ' ? '\u00A0' : char}
                        </span>
                    ))}
                </span>
            </h1>

            <div className='relative z-10 flex flex-col lg:flex-row items-center justify-center gap-12 w-full max-w-6xl animate-fade-in-up delay-200'>
                <div className='flex flex-col items-center lg:items-start text-center lg:text-left gap-6 lg:w-1/2'>
                    <p className='max-w-xl text-[#bac2de] text-base sm:text-lg leading-relaxed'>
                        A full stack developer with experience in both team projects and individual work.
                        I focus on building scalable, efficient solutions with a structured,
                        problem-solving mindset.
                    </p>
                    <a href={cv} download="Joshua_Klein_Malonda_Resume.pdf" className="btn btn-outline btn-success rounded-full px-8 transition-all duration-300 hover:shadow-[0_0_20px_rgba(166,227,161,0.2)] hover:scale-105">
                        Download CV
                    </a>
                </div>

                <div className='w-full max-w-2xl lg:w-1/2 rounded-2xl overflow-hidden border border-[#313244] bg-[#1e1e2e] animate-glow-pulse'>
                    <div className='flex items-center gap-2 px-4 py-2.5 bg-[#181825] border-b border-[#313244]'>
                        <div className='flex gap-1.5'>
                            <div className='w-3 h-3 rounded-full bg-[#f38ba8] transition-shadow hover:shadow-[0_0_8px_rgba(243,139,168,0.5)]'></div>
                            <div className='w-3 h-3 rounded-full bg-[#f9e2af] transition-shadow hover:shadow-[0_0_8px_rgba(249,226,175,0.5)]'></div>
                            <div className='w-3 h-3 rounded-full bg-[#a6e3a1] transition-shadow hover:shadow-[0_0_8px_rgba(166,227,161,0.5)]'></div>
                        </div>
                        <span className='text-[#6c7086] text-sm ml-4 font-mono'>{terminalTitle}</span>
                    </div>
                    <div className='p-6 text-sm leading-relaxed text-[#cdd6f4] font-mono'>
                        {/* whoami */}
                        {visibleLines >= 1 && (
                            <>
                                <p>
                                    <span className='text-[#89dceb]'>{terminal}</span>
                                    <span className='text-[#6c7086]'>:~$</span>{' '}
                                    <span>whoami</span>
                                </p>
                                <div className='animate-fade-in'>
                                    <p className='mt-2'>{personalDetails[0]}</p>
                                    <p className='text-[#6c7086] mt-1'>{personalDetails[1]}</p>
                                    <p className='text-[#6c7086] mt-1'>{personalDetails[2]}</p>
                                </div>
                            </>
                        )}

                        {/* cat techstack.txt */}
                        {visibleLines >= 2 && (
                            <>
                                <p className='mt-4'>
                                    <span className='text-[#89dceb]'>{terminal}</span>
                                    <span className='text-[#6c7086]'>~$</span>{' '}
                                    <span>cat techstack.txt</span>
                                </p>
                                <div className='flex flex-wrap gap-3 mt-2 animate-fade-in'>
                                    {techStack.map(({ name, icon }, i) => (
                                        <div
                                            key={name}
                                            className='flex items-center gap-1.5 px-2 py-1 rounded-md transition-all duration-200 hover:bg-[#313244] hover:text-[#89dceb] cursor-default'
                                            title={name}
                                            style={{ animationDelay: `${i * 50}ms` }}
                                        >
                                            <svg role="img" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                                <path d={icon.path} />
                                            </svg>
                                            <span>{name}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* echo $STATUS */}
                        {visibleLines >= 3 && (
                            <>
                                <p className='mt-4'>
                                    <span className='text-[#89dceb]'>{terminal}</span>
                                    <span className='text-[#6c7086]'>~$</span>{' '}
                                    <span>echo $STATUS</span>
                                </p>
                                <p className='text-[#a6e3a1] mt-2 animate-fade-in'>Open to internships - 2027</p>
                            </>
                        )}

                        {/* Typing line */}
                        {visibleLines < commands.length && (
                            <p className='mt-4'>
                                <span className='text-[#89dceb]'>{terminal}</span>
                                <span className='text-[#6c7086]'>~$</span>{' '}
                                <span>{typedCmd}</span>
                                <span className='animate-blink text-[#89dceb]'>█</span>
                            </p>
                        )}

                        {/* Final prompt */}
                        {visibleLines >= commands.length && (
                            <p className='mt-4'>
                                <span className='text-[#89dceb]'>{terminal}</span>
                                <span className='text-[#6c7086]'>~$</span>{' '}
                                <span className='animate-blink text-[#89dceb]'>█</span>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
