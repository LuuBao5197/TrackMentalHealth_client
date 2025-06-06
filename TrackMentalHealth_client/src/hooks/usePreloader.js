import { useEffect } from 'react';

export default function usePreloader() {
  useEffect(() => {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    window.addEventListener('load', () => {
      preloader.remove();
    });
  }, []);
}
