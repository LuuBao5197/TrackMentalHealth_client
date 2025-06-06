import { useEffect } from 'react';

export default function useBodyScrolled() {
  useEffect(() => {
    const toggleScrolled = () => {
      const header = document.querySelector('#header');
      if (!header) return;
      if (
        header.classList.contains('scroll-up-sticky') ||
        header.classList.contains('sticky-top') ||
        header.classList.contains('fixed-top')
      ) {
        if (window.scrollY > 100) {
          document.body.classList.add('scrolled');
        } else {
          document.body.classList.remove('scrolled');
        }
      }
    };

    toggleScrolled();
    window.addEventListener('scroll', toggleScrolled);
    window.addEventListener('load', toggleScrolled);

    return () => {
      window.removeEventListener('scroll', toggleScrolled);
      window.removeEventListener('load', toggleScrolled);
    };
  }, []);
}
