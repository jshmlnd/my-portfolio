import { SiCisco, SiGoogle, SiComptia, SiKubernetes } from 'react-icons/si';
import { Cloud, Server, Code2 } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';

const certifications = [
    { name: 'Web Development Fundamentals', icon: Code2, year: '2026', url: 'https://www.credly.com/badges/bf0361c4-31fa-4687-9be5-36e32f40936a' },
];

const iconColorMap = {
    SiCisco: 'text-[#049fd9]',
    Cloud: 'text-[#ff9900]',
    Server: 'text-[#00a4ef]',
    SiGoogle: 'text-[#4285f4]',
    SiComptia: 'text-[#e4002b]',
    SiKubernetes: 'text-[#326ce5]',
    Code2: 'text-[#e44d26]',
};

const Certifications = () => {
    const revealRef = useReveal();

    return (
        <section id='certs' className='bg-[#0d0221] px-6 py-16 min-h-screen'>
            <div className='max-w-6xl mx-auto flex flex-col gap-8 reveal' ref={revealRef}>
                <h2 className='text-4xl sm:text-5xl font-black uppercase tracking-tighter'>
                    <span className='gradient-text'>Certifications</span>
                </h2>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {certifications.map(({ name, icon: Icon, year, url }, i) => {
                        const iconName = Icon?.displayName || Icon?.name || '';
                        const colorClass = iconColorMap[iconName] || 'text-[#89dceb]';
                        const Tag = url ? 'a' : 'div';
                        const linkProps = url ? { href: url, target: '_blank', rel: 'noopener noreferrer' } : {};

                        return (
                            <Tag
                                key={name}
                                {...linkProps}
                                className={`group flex items-center gap-4 bg-[#1e1e2e] border border-[#313244] rounded-xl p-4 transition-all duration-300 hover:border-[#89dceb]/30 hover:shadow-[0_0_20px_rgba(137,220,235,0.08)] hover:-translate-y-1 animate-fade-in-up ${url ? 'cursor-pointer' : ''}`}
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                <div className={`shrink-0 ${colorClass} transition-transform duration-300 group-hover:scale-110`}>
                                    <Icon size={28} />
                                </div>
                                <div className='flex-1 min-w-0'>
                                    <p className='text-sm font-semibold text-[#cdd6f4] truncate group-hover:text-[#89dceb] transition-colors duration-300'>{name}</p>
                                    <p className='text-xs text-[#6c7086]'>{year}</p>
                                </div>
                            </Tag>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Certifications;
