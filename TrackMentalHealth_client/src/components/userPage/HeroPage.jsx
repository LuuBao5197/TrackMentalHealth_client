// src/pages/HeroPage.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BsPen, BsClockHistory, BsPencilSquare
} from 'react-icons/bs';
import illustration from '@assets/img/illustration/illustration-16.webp';
import {
  createMood,
  updateMood,
  getMoodLevels,
  getTodayMood
} from '../../api/moodAPI';

const moodIcons = {
  "Rất tệ": "😢",
  "Tệ": "😟",
  "Bình thường": "😐",
  "Vui": "😊",
  "Rất vui": "😄",
};

const HeroPage = () => {
  const [moodLevels, setMoodLevels] = useState([]);
  const [selectedMoodId, setSelectedMoodId] = useState(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [todayMood, setTodayMood] = useState(null);

  useEffect(() => {
    getMoodLevels()
      .then(res => setMoodLevels(res.data))
      .catch(err => console.error('Lỗi tải moods:', err));

    getTodayMood()
      .then(res => {
        if (res.data.length > 0) {
          const mood = res.data[0];
          setTodayMood(mood);
          setSelectedMoodId(mood.moodLevel.id);
          setNote(mood.note || '');
        }
      })
      .catch(err => console.error("Lỗi kiểm tra mood hôm nay:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMoodId) return alert("Vui lòng chọn cảm xúc");

    const mood = {
      date: new Date().toISOString().split("T")[0],
      note,
      moodLevel: { id: selectedMoodId },
    };

    setLoading(true);
    try {
      if (todayMood) {
        const updated = await updateMood(todayMood.id, { ...mood, id: todayMood.id });
        alert("✅ Cập nhật cảm xúc thành công!");
        setTodayMood(updated.data);
      } else {
        const created = await createMood(mood);
        alert("✅ Ghi nhận cảm xúc thành công!");
        setTodayMood(created.data);
      }
    } catch (err) {
      console.error("Lỗi tạo/cập nhật mood:", err);
      alert("❌ Lỗi ghi cảm xúc");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="hero" className="hero section">
      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="row mb-5">
          <div className="col-lg-8 mx-auto text-center">
            <h3 className="mb-4 fw-bold">
              {todayMood ? "💬 Cảm xúc của bạn hôm nay" : "💬 Hôm nay bạn cảm thấy thế nào?"}
            </h3>

            <div className="d-flex justify-content-center flex-wrap gap-3 mb-4">
              {moodLevels.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`btn rounded-pill py-3 px-4 border shadow-sm ${
                    selectedMoodId === m.id ? 'btn-primary text-white' : 'btn-light'
                  }`}
                  style={{ width: '110px', height: '110px', fontSize: '1rem' }}
                  onClick={() => setSelectedMoodId(m.id)}
                >
                  <div style={{ fontSize: "2.5rem" }}>
                    {moodIcons[m.name] || '❔'}
                  </div>
                  <div className="mt-2">{m.name}</div>
                </button>
              ))}
            </div>

            <textarea
              className="form-control mb-4 shadow-sm"
              rows={4}
              placeholder="📝 Ghi chú thêm về cảm xúc hôm nay..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{ fontSize: '1.1rem' }}
            />

            <button
              type="submit"
              className="btn btn-success px-4 py-2 fs-5"
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading ? 'Đang lưu...' : (todayMood ? '📤 Cập nhật cảm xúc' : '💾 Lưu cảm xúc')}
            </button>
          </div>
        </div>

        <div className="row feature-boxes">
          <FeatureBox
            icon={<BsPen />}
            title="Ghi nhật ký"
            text="Bắt đầu ghi"
            delay="200"
            link="/user/write-diary"
          />
          <FeatureBox
            icon={<BsClockHistory />}
            title="Xem lại lịch sử"
            text="Theo dõi cảm xúc theo thời gian một cách trực quan."
            delay="300"
            link="/user/history"
          />
          <FeatureBox
            icon={<BsPencilSquare />}
            title="Cập nhật nhật ký"
            text="Bổ sung hay thay đổi suy nghĩ trong nhật ký."
            delay="400"
            link="/user/edit-diary"
          />
        </div>
      </div>
    </section>
  );
};

const FeatureBox = ({ icon, title, text, delay, link }) => (
  <div className="col-lg-4 mb-4 mb-lg-0" data-aos="fade-up" data-aos-delay={delay}>
    <Link to={link || "#"} className="text-decoration-none text-dark">
      <div className="feature-box d-flex">
        <div className="feature-icon me-sm-4 mb-3 mb-sm-0 fs-3">{icon}</div>
        <div className="feature-content">
          <h3 className="feature-title">{title}</h3>
          <p className="feature-text">{text}</p>
        </div>
      </div>
    </Link>
  </div>
);

export default HeroPage;
