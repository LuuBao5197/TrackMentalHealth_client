
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
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    getMoodLevels()
      .then(res => setMoodLevels(res.data))
      .catch(err => console.error('Lỗi tải moods:', err));

    getTodayMood()
      .then(res => {
        const mood = res.data;
        if (mood) {
          setTodayMood(mood);
          setSelectedMoodId(mood.moodLevel.id);
          setNote(mood.note || '');
          setAiSuggestion(mood.aiSuggestion || '');
        }
      })
      .catch(err => console.error("Lỗi kiểm tra mood hôm nay:", err));

  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMoodId) return alert("Vui lòng chọn cảm xúc");

    const selectedMood = moodLevels.find(m => m.id === selectedMoodId);
    const mood = {
      date: new Date().toISOString().split("T")[0],
      note,
      moodLevel: {
        id: selectedMoodId,
        name: selectedMood?.name || "",
      },
    };

    setLoading(true);
    try {
      if (todayMood) {
        const updated = await updateMood(todayMood.id, { ...mood, id: todayMood.id });
        setTodayMood(updated.data);
        setAiSuggestion(updated.data.aiSuggestion || '✅ Cập nhật cảm xúc thành công!');
        setShowModal(true);
      } else {
        const created = await createMood(mood);
        setTodayMood(created.data);
        setAiSuggestion(created.data.aiSuggestion || '✅ Ghi nhận cảm xúc thành công!');
        setShowModal(true);
      }
    } catch (err) {
      console.error("Lỗi tạo/cập nhật mood:", err);
      setAiSuggestion("❌ Lỗi khi ghi nhận cảm xúc.");
      setShowModal(true);
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
  className={`btn btn-mood border shadow-sm ${selectedMoodId === m.id ? 'btn-primary text-white' : 'btn-light'}`}
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

        {/* ✅ Modal hiển thị gợi ý từ AI */}
        {showModal && (
          <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Message</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  <p>{aiSuggestion}</p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-primary" onClick={() => setShowModal(false)}>
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
            title="Lịch sử cảm xúc"
            text="Xem biểu đồ và lịch sử cảm xúc của bạn."
            delay="400"
            link="/user/mood-history"
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
