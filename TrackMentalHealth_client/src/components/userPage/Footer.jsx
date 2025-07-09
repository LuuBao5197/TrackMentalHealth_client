import React from "react";

const Footer = () => {
  return (
    <footer id="footer" className="footer light-background">
      <div className="container footer-top">
        <div className="row gy-4">
          <div className="col-lg-4 col-md-6 footer-about">
            <a href="/" className="logo d-flex align-items-center">
              <span className="sitename">Track Mental Health</span>
            </a>
            <div className="footer-contact pt-3">
              <p>21Bis Hau Giang Street</p>
              <p>Tan Son Nhat, TP.HCM</p>
              <p className="mt-3">
                <strong>Phone:</strong> <span>+84 962442723</span>
              </p>
              <p>
                <strong>Email:</strong> <span>trackmentalhealth5AESN@gmail.com</span>
              </p>
            </div>
            <div className="social-links d-flex mt-4">
              <a href="#"><i className="bi bi-twitter-x"></i></a>
              <a href="#"><i className="bi bi-facebook"></i></a>
              <a href="#"><i className="bi bi-instagram"></i></a>
              <a href="#"><i className="bi bi-linkedin"></i></a>
            </div>
          </div>

          <div className="col-lg-2 col-md-3 footer-links">
            <h4>Useful Links</h4>
            <ul>
              <li><a href="#">Home</a></li>
              <li><a href="#">About us</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Lesson</a></li>
              <li><a href="#">Test</a></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-3 footer-links">
            <h4>Our Services</h4>
            <ul>
              <li><a href="#">Register psychologist</a></li>
              <li><a href="#">Register content_creator</a></li>
              <li><a href="#">Register test designer</a></li>
              <li><a href="#">Register users</a></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-3 footer-links">
            <h4>Advance Feature</h4>
            <ul>
              <li><a href="#">Connect psychologist </a></li>
              <li><a href="#">Chat with AI expert</a></li>
              
            </ul>
          </div>

          <div className="col-lg-2 col-md-3 footer-links">
            <h4>Comunity</h4>
            <ul>
              <li><a href="#">Mental Social</a></li>
              <li><a href="#">Feedback about website</a></li>
 
            </ul>
          </div>
        </div>
      </div>

      <div className="container copyright text-center mt-4">
        <p>© <span>Copyright</span> <strong className="px-1 sitename">Track Mental Health</strong> <span>All Rights Reserved</span></p>
        <div className="credits">
          Designed by Team 1 - T1.2308AO -  <a href="https://aptech.fpt.edu.vn/">FPT APTECH TPHCM</a>
        </div>  
      </div>
    </footer>
  );
};

export default Footer;
