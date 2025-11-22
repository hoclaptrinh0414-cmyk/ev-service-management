import React from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from 'antd';

// Styled Components
const FooterWrapper = styled.div`
  background-color: #0A0A0A;
  color: #a0a0a0;
  overflow: hidden; /* Ensures no weird overflows from animations */
`;

const CTASection = styled.div`
  padding: 80px 50px;
  text-align: center;
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid #222;

  /* Existing radial gradient animation */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(ellipse at 30% 20%, rgba(56, 189, 248, 0.15), transparent 70%),
      radial-gradient(ellipse at 80% 40%, rgba(192, 132, 252, 0.15), transparent 70%),
      radial-gradient(ellipse at 50% 90%, rgba(251, 113, 133, 0.15), transparent 70%);
    animation: pulse 15s infinite ease-in-out;
    z-index: 1; /* Ensure it's below the content */
  }

  

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
`;

const CTATitle = styled(motion.h2)`
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 20px;
  text-shadow: 0 2px 15px rgba(0,0,0,0.3);
  position: relative; /* Ensure text is above pseudo-elements */
  z-index: 3;
`;

const CTAButtonWrapper = styled(motion.div)`
  position: relative; /* Ensure button is above pseudo-elements */
  z-index: 3;
`;


const FooterContainer = styled(motion.footer)`
  padding: 60px 50px 30px;
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr repeat(3, 1fr);
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 992px) {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }
`;

const FooterColumn = styled(motion.div)`
  display: flex;
  flex-direction: column;
`;

const BrandColumn = styled(FooterColumn)`
  gap: 15px;
`;

const LogoText = styled(Link)`
  font-size: 1.8rem;
  font-weight: 700;
  color: #fff;
  text-decoration: none;
`;

const ColumnTitle = styled.h5`
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 20px;
  letter-spacing: 0.5px;
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NavItem = styled.li`
  margin-bottom: 12px;
`;

const NavLink = styled(Link)`
  color: #a0a0a0;
  text-decoration: none;
  transition: color 0.3s ease;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    width: 0;
    height: 1px;
    bottom: -2px;
    left: 0;
    background-color: #38bdf8;
    transition: width 0.3s ease-out;
  }

  &:hover {
    color: #ffffff;
    &::after {
      width: 100%;
    }
  }
`;

const SocialIconsContainer = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 10px;
`;

const SocialIcon = styled(motion.a)`
  color: #a0a0a0;
  font-size: 1.2rem;
  transition: color 0.3s ease;

  &:hover {
    color: #ffffff;
  }
`;

const FooterBottom = styled.div`
  text-align: center;
  margin-top: 50px;
  padding-top: 30px;
  border-top: 1px solid #333;
  font-size: 0.9rem;
`;

const Footer = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
  };

  return (
    <FooterWrapper>
      <FooterContainer>
        <FooterGrid as={motion.div} variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
          <BrandColumn as={motion.div} variants={itemVariants}>
            <LogoText to="/home">T&N EV Services</LogoText>
            <p>
              Nền tảng hàng đầu cho việc bảo trì, sửa chữa và nâng cấp xe điện với công nghệ hiện đại và đội ngũ chuyên nghiệp.
            </p>
            <SocialIconsContainer>
              <SocialIcon href="#" target="_blank" rel="noopener noreferrer" whileHover={{ y: -3, scale: 1.1 }}><FaFacebookF /></SocialIcon>
              <SocialIcon href="#" target="_blank" rel="noopener noreferrer" whileHover={{ y: -3, scale: 1.1 }}><FaTwitter /></SocialIcon>
              <SocialIcon href="#" target="_blank" rel="noopener noreferrer" whileHover={{ y: -3, scale: 1.1 }}><FaInstagram /></SocialIcon>
              <SocialIcon href="#" target="_blank" rel="noopener noreferrer" whileHover={{ y: -3, scale: 1.1 }}><FaLinkedinIn /></SocialIcon>
            </SocialIconsContainer>
          </BrandColumn>

          <FooterColumn as={motion.div} variants={itemVariants}>
            <ColumnTitle>Điều hướng</ColumnTitle>
            <NavList>
              <NavItem><NavLink to="/home">Trang chủ</NavLink></NavItem>
              <NavItem><NavLink to="/services">Dịch vụ</NavLink></NavItem>
              <NavItem><NavLink to="#">Blog</NavLink></NavItem>
              <NavItem><NavLink to="#">Giới thiệu</NavLink></NavItem>
            </NavList>
          </FooterColumn>

          <FooterColumn as={motion.div} variants={itemVariants}>
            <ColumnTitle>Pháp lý</ColumnTitle>
            <NavList>
              <NavItem><NavLink to="#">Điều khoản dịch vụ</NavLink></NavItem>
              <NavItem><NavLink to="#">Chính sách bảo mật</NavLink></NavItem>
            </NavList>
          </FooterColumn>

          <FooterColumn as={motion.div} variants={itemVariants}>
            <ColumnTitle>Liên hệ</ColumnTitle>
            <NavList>
              <NavItem>support@ev-service.vn</NavItem>
              <NavItem>+84 334 171 139</NavItem>
              <NavItem>160 Lã Xuân Oai, TP. Thủ Đức</NavItem>
            </NavList>
          </FooterColumn>

        </FooterGrid>
        <FooterBottom>
          <p>&copy; {new Date().getFullYear()} T&N EV Services. All Rights Reserved.</p>
        </FooterBottom>
      </FooterContainer>
    </FooterWrapper>
  );
};

export default Footer;
