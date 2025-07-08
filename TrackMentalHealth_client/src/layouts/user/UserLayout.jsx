import React, { useEffect } from 'react';
import Header from '@components/userPage/Header';
import Footer from '@components/userPage/Footer'; 
import HeroPage from '@components/userPage/HeroPage';
import AboutSection from '@components/userPage/AboutSection';
import HowWeWork from '@components/userPage/HowWeWork';
import Services from '@components/userPage/Services';
import ServicesAlt from '@components/userPage/ServicesAlt';
import CallToAction2 from '@components/userPage/CallToAction2';
import Pricing from '@components/userPage/Pricing';
import FAQ from '@components/userPage/FAQ';
import Portfolio from '@components/userPage/Portfolio'
import TeamSection from '@components/userPage/TeamSection'
// import Testimonials from '../../pages/Testimonials'
import ContactSection from '@components/userPage/ContactSection'

import '../../assets/css/main.css';
import useBodyScrolled from '../../hooks/useBodyScrolled';
import useMobileNavToggle from '../../hooks/useMobileNavToggle';
import useScrollTopButton from '../../hooks/useScrollTopButton';
import useAOS from '../../hooks/useAOS';
import usePreloader from '../../hooks/usePreloader';

import { Outlet } from 'react-router';
import { useSelector } from 'react-redux';
import AllForm from '../../components/LessonPage/AllForm';
const UserLayout = () => {
  // Thêm class vào body
  const userRole = useSelector((state) => state.auth.user);
  console.log(userRole);

  // Xác định có đang ở trang chính /user hay không
  const isHomePage =
    location.pathname === '/user' || location.pathname === '/TrackMentalHealth/user';

  // Add/remove class vào body
  useEffect(() => {
    document.body.classList.add('index-page');

    // Cleanup: xóa khi component unmount
    return () => {
      document.body.classList.remove('index-page');
    };
  }, []);
  useBodyScrolled();
  useMobileNavToggle();
  useScrollTopButton();
  useAOS();
  usePreloader();

  return (
    <div>
      <Header/>
      <HeroPage />
      <AllForm/>
      {/* <AboutSection />
      <HowWeWork/>
      <Portfolio/>
      <Services/>
      <ServicesAlt/>
      <CallToAction2/>
      <Pricing/>
      <FAQ/>
      <TeamSection/> */}
      {/* <Testimonials/> */}
      {/* <ContactSection/> */}
       <Outlet />
      <Footer />
    </div>
  );
};

export default UserLayout;
