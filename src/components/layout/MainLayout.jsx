import React from 'react';
import GlobalNavbar from '../GlobalNavbar';
import Footer from './Footer'; // Import the new Footer component
import './MainLayout.css';

const MainLayout = ({ children }) => {
  return (
    <>
      <GlobalNavbar />
      <main className="main-content-area">
        {children}
      </main>
      <Footer />
    </>
  );
};

export default MainLayout;