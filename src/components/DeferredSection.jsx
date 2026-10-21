import { useEffect, useRef, useState } from 'react';

const DeferredSection = ({ children }) => {
  const [ready, setReady] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      setReady(true);
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setReady(true);
      observer.disconnect();
    }, { rootMargin: '600px 0px' });

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={sectionRef}>
      {ready ? children : <div className="h-24 border-t border-[#1f1f23] bg-[#09090b]" aria-hidden="true" />}
    </div>
  );
};

export default DeferredSection;
