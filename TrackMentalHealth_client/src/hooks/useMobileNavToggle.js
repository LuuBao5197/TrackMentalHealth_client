import { useEffect } from 'react';

export default function useMobileNavToggle() {
  useEffect(() => {
    const toggleBtn = document.querySelector('.mobile-nav-toggle');

    const handleToggle = () => {
      document.body.classList.toggle('mobile-nav-active');
      toggleBtn.classList.toggle('bi-list');
      toggleBtn.classList.toggle('bi-x');
    };

    if (toggleBtn) {
      toggleBtn.addEventListener('click', handleToggle);
    }

    return () => {
      if (toggleBtn) {
        toggleBtn.removeEventListener('click', handleToggle);
      }
    };
  }, []);
}
