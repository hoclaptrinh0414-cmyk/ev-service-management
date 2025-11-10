// src/pages/Services.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiTool, FiCalendar } from 'react-icons/fi';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Services = () => {
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Prevent scrollbar during animation
    document.body.style.overflow = 'hidden';

    // Trigger animation after component mounts
    setTimeout(() => {
      setShowContent(true);
    }, 100);

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);


  return (
    <>
      {/* Main Content */}
        <div className={`services-page ${isExiting ? 'exiting' : ''}`}>
          <main className="main-content">
            <h1 className={`hero-title ${showContent ? 'show' : ''}`}>Good service, good car.</h1>
            {/* 3 static feature cards (subtitle reveals on hover) */}
            <section className={`feature-grid ${showContent ? 'show' : ''}`}>
              <div className="feature-item" onClick={() => navigate('/products')}>
                <div className="feature-icon"><FiShoppingCart size={44} /></div>
                <h3 className="feature-title">Single Product & Combo</h3>
                <p className="feature-subtitle">Premium EV parts and curated bundles</p>
              </div>

              <div className="feature-item" onClick={() => navigate('/my-appointments')}>
                <div className="feature-icon"><FiCalendar size={44} /></div>
                <h3 className="feature-title">Upcoming Appointments</h3>
                <p className="feature-subtitle">View your scheduled service appointments</p>
              </div>

              <div className="feature-item" onClick={() => navigate('/schedule-service')}>
                <div className="feature-icon"><FiTool size={44} /></div>
                <h3 className="feature-title">Schedule Service</h3>
                <p className="feature-subtitle">Book a professional appointment</p>
              </div>
            </section>
          </main>
        </div>

      <style jsx>{`
        .services-page { min-height: 100vh; height: auto; background: #ffffff; overflow: hidden; position: relative; }

        /* Exit animation for cards - Fade out only */
        .services-page.exiting .service-card {
          animation: fadeOutExit 0.3s ease-out forwards !important;
        }

        @keyframes fadeOutExit {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }

        /* Main Content */
        .main-content {display: flex ;flex-direction: column; padding: 160px 40px 80px; background: transparent; min-height: 100vh; height: auto; position: relative; z-index: 2; text-align: center; gap: 4rem;}

        /* Hero Title Animation - Slide from left */
        .hero-title {
          font-size: clamp(2.4rem, 7vw, 5rem);
          font-weight: 800;
          color: #0d0d0d;
          margin: 0 0 40px;
          letter-spacing: 0.02em;
          margin-top: 4rem;
          opacity: 0;
          transform: translateX(-100px);
          transition: all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .hero-title.show {
          opacity: 1;
          transform: translateX(0);
        }

        .carousel-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 600px;
        }
        

        /* Features */
        .feature-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: -1rem;
          opacity: 0;
          transition: opacity 1.2s ease;
        }

        .feature-grid.show {
          opacity: 1;
        }

        .feature-item {
          background: transparent;
          padding: 28px 22px;
          text-align: center;
          cursor: pointer;
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .feature-item:hover { transform: scale(1.04);border-color: rgba(0,0,0,0.16); }
        .feature-icon { color: #121212; margin-bottom: 12px; opacity: 0.92; }
        .feature-title { margin: 0 0 8px; font-size: 1.3rem; font-weight: 700; color: #111; }
        .feature-subtitle { margin: 0; color: rgba(0,0,0,0.7); line-height: 1.6; font-size: 0.98rem; opacity: 0; transform: translateY(6px); transition: opacity 0.25s ease, transform 0.25s ease; }
        .feature-item:hover .feature-subtitle { opacity: 1; transform: translateY(0); }


        /* Responsive */
        @media (max-width: 1200px) { .feature-grid { grid-template-columns: 1fr 1fr; } }

        @media (max-width: 768px) { .main-content { padding: 110px 20px 60px; } .feature-grid { grid-template-columns: 1fr; gap: 24px; } }

        @media (max-width: 576px) { .main-content { padding: 90px 15px 30px; } }
      `}</style>
    </>
  );
};

export default Services;
