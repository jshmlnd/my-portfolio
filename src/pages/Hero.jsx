import { siJavascript, siTypescript, siReact, siNextdotjs, siLua, siOpenjdk, siPython, siMongodb } from 'simple-icons';
import cv from '../assets/cv/Joshua_Klein_Malonda_Resume.pdf';

const terminalTitle = 'jshmlnd@jshmld-VirtualBox ~ zsh';
const terminal = terminalTitle.slice(0, 25);

const personalDetails = ["Joshua Klein Malonda", "BS Computer Science · Legazpi City, PH", "University of Santo Tomas - Legazpi"];
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

const Hero = () => {
    return (
        <section id='hero' className='min-h-screen flex flex-col items-center justify-center bg-[#0d0221] gap-12 px-6'>
            <h1 className='text-5xl sm:text-7xl lg:text-8xl font-black text-white leading-tight tracking-wide'>
                FULL STACK DEVELOPER
                <br />
                JOSHUA MALONDA
            </h1>

            <div className='flex flex-col lg:flex-row items-center justify-center gap-12 w-full max-w-6xl'>
                <div className='flex flex-col items-center lg:items-start text-center lg:text-left gap-6 lg:w-1/2'>
                    <p className='max-w-xl text-[#bac2de] text-base sm:text-lg leading-relaxed'>
                        A full stack developer with experience in both team projects and individual work.
                        I focus on building scalable, efficient solutions with a structured,
                        problem-solving mindset.
                    </p>
                    <a href={cv} download="Joshua_Klein_Malonda_Resume.pdf" className="btn btn-outline btn-success rounded-full px-8">
                        Download CV
                    </a>
                </div>

                <div className='w-full max-w-2xl lg:w-1/2 rounded-2xl overflow-hidden border border-[#313244] bg-[#1e1e2e]'>
                <div className='flex items-center gap-2 px-4 py-2.5 bg-[#181825] border-b border-[#313244]'>
                    <div className='flex gap-1.5'>
                        <div className='w-3 h-3 rounded-full bg-[#f38ba8]'></div>
                        <div className='w-3 h-3 rounded-full bg-[#f9e2af]'></div>
                        <div className='w-3 h-3 rounded-full bg-[#a6e3a1]'></div>
                    </div>
                    <span className='text-[#6c7086] text-sm ml-4'>{terminalTitle}</span>
                </div>
                <div className='p-6 text-sm leading-relaxed text-[#cdd6f4]' style={{ fontFamily: 'monospace' }}>
                    <p>
                        <span className='text-[#89dceb]'>{terminal}</span>
                        <span className='text-[#6c7086]'>:~$</span>{' '}
                        <span>whoami</span>
                    </p>
                    <p className='mt-2'>{personalDetails[0]}</p>
                    <p className='text-[#6c7086] mt-1'>{personalDetails[1]}</p>
                    <p className='text-[#6c7086] mt-1'>{personalDetails[2]}</p>

                    <p className='mt-4'>
                        <span className='text-[#89dceb]'>{terminal}</span>
                        <span className='text-[#6c7086]'>~$</span>{' '}
                        <span>cat techstack.txt</span>
                    </p>
                    <div className='flex flex-wrap gap-3 mt-2'>
                        {techStack.map(({ name, icon }) => (
                            <div key={name} className='flex items-center gap-1.5' title={name}>
                                <svg role="img" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                    <path d={icon.path} />
                                </svg>
                                <span>{name}</span>
                            </div>
                        ))}
                    </div>

                    <p className='mt-4'>
                        <span className='text-[#89dceb]'>{terminal}</span>
                        <span className='text-[#6c7086]'>~$</span>{' '}
                        <span>echo $STATUS</span>
                    </p>
                    <p className='text-[#a6e3a1] mt-2'>Open to internships - 2027</p>
                    <p className='mt-4'>
                        <span className='text-[#89dceb]'>{terminal}</span>
                        <span className='text-[#6c7086]'>~$</span>{' '}
                        <span className='animate-pulse [animation-duration:1s]'>█</span>
                    </p>
                </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
