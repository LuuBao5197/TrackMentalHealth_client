import { useEffect } from 'react';

export default function useScrollTopButton() {
  useEffect(() => {
    const scrollTop = document.querySelector('.scroll-top');

    const toggleScrollTop = () => {
      if (!scrollTop) return;
      window.scrollY > 100
        ? scrollTop.classList.add('active')
        : scrollTop.classList.remove('active');
    };

    const scrollToTop = (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (scrollTop) {
      scrollTop.addEventListener('click', scrollToTop);
    }

    window.addEventListener('scroll', toggleScrollTop);
    window.addEventListener('load', toggleScrollTop);

    return () => {
      if (scrollTop) scrollTop.removeEventListener('click', scrollToTop);
      window.removeEventListener('scroll', toggleScrollTop);
      window.removeEventListener('load', toggleScrollTop);
    };
  }, []);
}
