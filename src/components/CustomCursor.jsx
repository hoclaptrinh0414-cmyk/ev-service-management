import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './CustomCursor.css';

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isVisible, setIsVisible] = useState(true);
  const location = useLocation();

  // All pages use black cursor
  const cursorColor = '#000000';

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className="custom-cursor visible"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        backgroundColor: cursorColor,
      }}
    />
  );
};

export default CustomCursor;
