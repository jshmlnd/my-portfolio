import { SiCisco, SiGoogle, SiComptia, SiKubernetes } from 'react-icons/si';
import { Cloud, Server } from 'lucide-react';

const certifications = [
    { name: 'Cisco Certified Network Associate', icon: SiCisco, year: '2026' },
    { name: 'AWS Certified Solutions Architect', icon: Cloud, year: '2026' },
    { name: 'Microsoft Certified: Azure Fundamentals', icon: Server, year: '2026' },
    { name: 'Google Advanced Data Analytics', icon: SiGoogle, year: '2026' },
    { name: 'CompTIA Security+', icon: SiComptia, year: '2026' },
    { name: 'Certified Kubernetes Application Developer', icon: SiKubernetes, year: '2026' },
];

const Certifications = () => {
    return (
        <section id='certs' className='bg-[#0d0221] px-6 py-16'>
            <div className='max-w-6xl mx-auto flex flex-col gap-8'>
                <h2 className='text-4xl sm:text-5xl font-black text-white uppercase tracking-tighter'>
                    Certifications
                </h2>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {certifications.map(({ name, icon: Icon, year }) => (
                        <div key={name} className='flex items-center gap-4 bg-[#1e1e2e] border border-[#313244] rounded-xl p-4'>
                            <div className='shrink-0 text-[#89dceb]'>
                                <Icon size={28} />
                            </div>
                            <div className='flex-1 min-w-0'>
                                <p className='text-sm font-semibold text-[#cdd6f4] truncate'>{name}</p>
                                <p className='text-xs text-[#6c7086]'>{year}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Certifications;
