// src/hooks/useNavigateWithTransition.js
import { useNavigate, useLocation } from 'react-router-dom';

export const useNavigateWithTransition = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigateWithTransition = (to) => {
    const currentPath = location.pathname;
    const targetPath = to;

    // Check if transition involves Home page
    const isHomeToOther = currentPath === '/home' && targetPath !== '/home';
    const isOtherToHome = currentPath !== '/home' && targetPath === '/home';
    const shouldAnimate = isHomeToOther || isOtherToHome;

    if (shouldAnimate) {
      // Freeze the current page (prevent any updates/unmounting)
      document.body.style.pointerEvents = 'none';

      // Dispatch custom event to trigger circle animation BEFORE navigation
      const event = new CustomEvent('startCircleTransition', {
        detail: {
          from: currentPath,
          to: targetPath
        }
      });
      window.dispatchEvent(event);

      // Navigate when circle has expanded to cover screen (around 50% of animation)
      setTimeout(() => {
        navigate(to);
        // Re-enable interactions after navigation
        setTimeout(() => {
          document.body.style.pointerEvents = 'auto';
        }, 100);
      }, 500); // Navigate at 50% of 1000ms animation
    } else {
      // No animation needed, navigate immediately
      navigate(to);
    }
  };

  return navigateWithTransition;
};
