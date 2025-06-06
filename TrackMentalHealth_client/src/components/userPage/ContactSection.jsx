import { useState } from 'react';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    // gửi dữ liệu nếu cần
  };

  return (
    <section id="contact" className="py-5 bg-light">
      <div className="container">
        <div className="text-center mb-5">
          <h2>Contact</h2>
          <p className="text-muted">
            Necessitatibus eius consequatur ex aliquid fuga eum quidem sint consectetur velit
          </p>
        </div>

        <div className="row text-center mb-5">
          <div className="col-md-4">
            <div className="p-4 bg-white shadow rounded">
              <i className="bi bi-geo-alt fs-2 text-primary mb-2"></i>
              <h5>Our Address</h5>
              <p>2847 Rainbow Road, Springfield, IL 62701, USA</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="p-4 bg-white shadow rounded">
              <i className="bi bi-telephone fs-2 text-primary mb-2"></i>
              <h5>Contact Number</h5>
              <p>Mobile: +1 (555) 123-4567<br />Email: info@example.com</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="p-4 bg-white shadow rounded">
              <i className="bi bi-clock fs-2 text-primary mb-2"></i>
              <h5>Opening Hour</h5>
              <p>Monday - Saturday: 9:00 - 18:00<br />Sunday: Closed</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 shadow rounded">
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-6">
              <label htmlFor="name" className="form-label">Your name*</label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="email" className="form-label">Email address*</label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="phone" className="form-label">Phone number*</label>
              <input
                type="text"
                className="form-control"
                id="phone"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="subject" className="form-label">Select service*</label>
              <select
                className="form-select"
                id="subject"
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
              >
                <option value="">Select service</option>
                <option value="Consulting">Consulting</option>
                <option value="Development">Development</option>
                <option value="Marketing">Marketing</option>
                <option value="Support">Support</option>
              </select>
            </div>

            <div className="col-12">
              <label htmlFor="message" className="form-label">Message*</label>
              <textarea
                className="form-control"
                id="message"
                name="message"
                rows="5"
                required
                value={formData.message}
                onChange={handleChange}
              />
            </div>

            <div className="col-12 text-center">
              <button type="submit" className="btn btn-primary px-4">Submit Message</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
