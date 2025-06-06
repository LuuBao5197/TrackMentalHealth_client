import { Card, CardContent } from "@/components/ui/card";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default function Testimonials() {
  return (
    <section id="testimonials" className="testimonials section">
      <div className="container section-title" data-aos="fade-up">
        <h2>Testimonials</h2>
        <p>Necessitatibus eius consequatur ex aliquid fuga eum quidem sint consectetur velit</p>
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <Swiper
          modules={[Pagination, Autoplay]}
          loop={true}
          speed={800}
          autoplay={{ delay: 5000 }}
          slidesPerView={1}
          spaceBetween={30}
          pagination={{ clickable: true }}
          breakpoints={{
            768: { slidesPerView: 2 },
            1200: { slidesPerView: 3 },
          }}
        >
          {[
            {
              quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.",
              name: "Robert Johnson",
              title: "Marketing Director",
              image: "assets/img/person/person-m-8.webp",
            },
            {
              quote: "Proin iaculis purus consequat sem cure digni ssim donec porttitora entum suscipit rhoncus.",
              name: "Lisa Williams",
              title: "Product Manager",
              image: "assets/img/person/person-f-3.webp",
            },
            {
              quote: "Enim nisi quem export duis labore cillum quae magna enim sint quorum nulla quem veniam duis minim tempor labore.",
              name: "Emma Parker",
              title: "UX Designer",
              image: "assets/img/person/person-f-10.webp",
            },
            {
              quote: "Fugiat enim eram quae cillum dolore dolor amet nulla culpa multos export minim fugiat minim velit.",
              name: "David Miller",
              title: "Senior Developer",
              image: "assets/img/person/person-m-5.webp",
            },
            {
              quote: "Quis quorum aliqua sint quem legam fore sunt eram irure aliqua veniam tempor noster veniam enim culpa labore.",
              name: "Michael Davis",
              title: "CEO & Founder",
              image: "assets/img/person/person-m-2.webp",
            },
            {
              quote: "Eius ipsam praesentium dolor quaerat inventore rerum odio. Quos laudantium adipisci eius.",
              name: "Sarah Thompson",
              title: "Art Director",
              image: "assets/img/person/person-f-7.webp",
            },
          ].map((testimonial, index) => (
            <SwiperSlide key={index}>
              <Card className="testimonial-card">
                <CardContent>
                  <div className="testimonial-content">
                    <p>
                      <i className="bi bi-quote quote-icon"></i>
                      {testimonial.quote}
                    </p>
                  </div>
                  <div className="testimonial-profile">
                    <div className="rating">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className="bi bi-star-fill"></i>
                      ))}
                    </div>
                    <div className="profile-info">
                      <img src={testimonial.image} alt="Profile Image" />
                      <div>
                        <h3>{testimonial.name}</h3>
                        <h4>{testimonial.title}</h4>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
