import React, { useState } from "react";

const faqData = [
  {
    question: "Vivamus suscipit tortor eget felis porttitor volutpat?",
    answer:
      "Nulla quis lorem ut libero malesuada feugiat. Vestibulum ac diam sit amet quam vehicula elementum sed sit amet dui. Curabitur aliquet quam id dui posuere blandit. Nulla porttitor accumsan tincidunt.",
    defaultOpen: true,
  },
  {
    question: "Curabitur aliquet quam id dui posuere blandit?",
    answer:
      "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula. Proin eget tortor risus. Mauris blandit aliquet elit, eget tincidunt nibh pulvinar.",
  },
  {
    question: "Sed porttitor lectus nibh ullamcorper sit amet?",
    answer:
      "Curabitur non nulla sit amet nisl tempus convallis quis ac lectus. Praesent sapien massa, convallis a pellentesque nec, egestas non nisi. Donec sollicitudin molestie malesuada. Vestibulum ac diam sit amet quam vehicula elementum.",
  },
  {
    question: "Nulla quis lorem ut libero malesuada feugiat?",
    answer:
      "Donec sollicitudin molestie malesuada. Quisque velit nisi, pretium ut lacinia in, elementum id enim. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec velit neque, auctor sit amet aliquam vel.",
  },
];

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(
    faqData.findIndex((item) => item.defaultOpen) || 0
  );

  const toggleFaq = (index) => {
    setActiveIndex((current) => (current === index ? -1 : index));
  };

  return (
    <section id="faq" className="faq section">
      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="row gy-5">
          {/* Left Contact Card */}
          <div className="col-lg-6" data-aos="zoom-out" data-aos-delay="200">
            <div className="faq-contact-card">
              <div className="card-icon">
                <i className="bi bi-question-circle"></i>
              </div>
              <div className="card-content">
                <h3>Still Have Questions?</h3>
                <p>
                  Vestibulum ante ipsum primis in faucibus orci luctus et
                  ultrices posuere cubilia Curae; Donec velit neque, auctor sit
                  amet aliquam vel, ullamcorper sit amet ligula. Vestibulum ac
                  diam sit amet quam vehicula elementum.
                </p>
                <div className="contact-options">
                  <a href="#" className="contact-option">
                    <i className="bi bi-envelope"></i>
                    <span>Email Support</span>
                  </a>
                  <a href="#" className="contact-option">
                    <i className="bi bi-chat-dots"></i>
                    <span>Live Chat</span>
                  </a>
                  <a href="#" className="contact-option">
                    <i className="bi bi-telephone"></i>
                    <span>Call Us</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Accordion */}
          <div className="col-lg-6" data-aos="fade-up" data-aos-delay="300">
            <div className="faq-accordion">
              {faqData.map((item, index) => (
                <div
                  key={index}
                  className={`faq-item ${activeIndex === index ? "faq-active" : ""}`}
                  data-aos={index !== 0 ? "zoom-in" : undefined}
                  data-aos-delay={index !== 0 ? 200 : undefined}
                >
                  <div
                    className="faq-header"
                    onClick={() => toggleFaq(index)}
                    style={{ cursor: "pointer" }}
                  >
                    <h3>{item.question}</h3>
                    <i
                      className={`bi bi-chevron-down faq-toggle ${
                        activeIndex === index ? "rotate" : ""
                      }`}
                    ></i>
                  </div>
                  {activeIndex === index && (
                    <div className="faq-content">
                      <p>{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
