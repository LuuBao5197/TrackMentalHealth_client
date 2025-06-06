import React from 'react';

const teamMembers = [
  {
    name: "Daniel Mitchell",
    position: "Creative Director",
    img: "assets/img/person/person-m-1.webp",
    delay: 100,
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque.",
  },
  {
    name: "Rebecca Taylor",
    position: "Lead Developer",
    img: "assets/img/person/person-f-6.webp",
    delay: 200,
    desc: "Aliquam tincidunt mauris eu risus. Vestibulum auctor dapibus neque. Nunc dignissim risus id metus.",
  },
  {
    name: "Marcus Johnson",
    position: "UI/UX Designer",
    img: "assets/img/person/person-m-6.webp",
    delay: 300,
    desc: "Cras ornare tristique elit. Integer in dui quis est placerat ornare. Phasellus a lacus a risus.",
  },
  {
    name: "Jessica Parker",
    position: "Marketing Strategist",
    img: "assets/img/person/person-f-3.webp",
    delay: 400,
    desc: "Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.",
  },
];

const TeamMember = ({ member }) => (
  <div className="col-md-6 col-lg-3" data-aos="zoom-in" data-aos-delay={member.delay}>
    <div className="team-card">
      <div className="team-image">
        <img src={member.img} className="img-fluid" alt={member.name} />
        <div className="team-overlay">
          <p>{member.desc}</p>
          <div className="team-social">
            <a href="#"><i className="bi bi-twitter-x"></i></a>
            <a href="#"><i className="bi bi-facebook"></i></a>
            <a href="#"><i className="bi bi-instagram"></i></a>
            <a href="#"><i className="bi bi-linkedin"></i></a>
          </div>
        </div>
      </div>
      <div className="team-content">
        <h4>{member.name}</h4>
        <span className="position">{member.position}</span>
      </div>
    </div>
  </div>
);

const TeamSection = () => {
  return (
    <section id="team" className="team section light-background">
      <div className="container section-title" data-aos="fade-up">
        <h2>Team</h2>
        <p>Necessitatibus eius consequatur ex aliquid fuga eum quidem sint consectetur velit</p>
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="row g-5">
          {teamMembers.map((member, index) => (
            <TeamMember key={index} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
