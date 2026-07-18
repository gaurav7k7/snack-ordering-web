import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useFloatingActionOffset } from '@/hooks/useFloatingActionOffset';

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const bottomOffset = useFloatingActionOffset();

  useEffect(() => {
    const onScroll = () => setIsVisible(window.scrollY > 500);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <Button
      size="icon"
      className="fixed right-6 z-50 rounded-full shadow-lg transition-[bottom]"
      style={{ bottom: bottomOffset }}
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <ArrowUp className="h-4 w-4" aria-hidden="true" />
    </Button>
  );
}
