import React, { useEffect, useState } from 'react';
import {
    getMoodStatistics,
    getMyMoodsPaged
} from '../../api/moodAPI';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import moment from 'moment';
import MentalAlertBox from '../../api/MentalAlertBox';

const MoodHistoryPage = () => {
    const [chartData, setChartData] = useState([]);
    const [aiAnalysis, setAiAnalysis] = useState('');
    const [filterRange, setFilterRange] = useState('7');

    const [pagedMoods, setPagedMoods] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 5;

    useEffect(() => {
        const fetchChartData = async () => {
    const res = await getMoodStatistics();
    const raw = res.data;
    const now = moment();
    const days = filterRange === '7' ? 7 : 30;

    const filtered = Object.entries(raw).filter(([key]) => {
        const date = moment(key);
        return date.isAfter(now.clone().subtract(days, 'days'), 'day');
    });

    const formatted = filtered.map(([dateStr, value]) => ({
        rawDate: moment(dateStr),
        date: moment(dateStr).format("DD/MM"),
        count: value
    })).sort((a, b) => a.rawDate - b.rawDate);

    setChartData(formatted);

    const moodMap = {
        1: 'Rất tệ', 2: 'Tệ', 3: 'Bình thường', 4: 'Vui', 5: 'Rất vui'
    };

    const levelCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    filtered.forEach(([_, level]) => {
        if (levelCounts[level] !== undefined) {
            levelCounts[level]++;
        }
    });

    const sortedByDate = filtered.map(([date, level]) => ({
        date: moment(date),
        level
    })).sort((a, b) => a.date - b.date);

    const half = Math.floor(sortedByDate.length / 2);
    const firstHalf = sortedByDate.slice(0, half);
    const secondHalf = sortedByDate.slice(half);

    const avgFirstHalf = firstHalf.reduce((sum, item) => sum + item.level, 0) / (firstHalf.length || 1);
    const avgSecondHalf = secondHalf.reduce((sum, item) => sum + item.level, 0) / (secondHalf.length || 1);

    // ✅ Phân tích xu hướng tổng quan
    let trendDescription = "";
    const diff = avgSecondHalf - avgFirstHalf;
    if (diff > 0.3) {
        trendDescription = "Cảm xúc có xu hướng tăng dần (đầu kỳ thấp, cuối kỳ cao).";
    } else if (diff < -0.3) {
        trendDescription = "Cảm xúc có xu hướng giảm dần (đầu kỳ cao, cuối kỳ thấp).";
    } else {
        trendDescription = "Cảm xúc ổn định, không có nhiều biến động rõ rệt.";
    }

    const entries = filtered.map(([date, level]) =>
        `Ngày ${moment(date).format('DD/MM')}: ${moodMap[level] || 'Không rõ'} (mức ${level})`
    ).join('\n');

    const aiPrompt = `
Dưới đây là thống kê cảm xúc của người dùng trong ${filterRange} ngày qua.
Mức độ cảm xúc: 
1: Rất tệ
2: Tệ
3: Bình thường
4: Vui
5: Rất vui

--- Thống kê ---
Số ngày mức 1 (Rất tệ): ${levelCounts[1]}
Số ngày mức 2 (Tệ): ${levelCounts[2]}
Số ngày mức 3 (Bình thường): ${levelCounts[3]}
Số ngày mức 4 (Vui): ${levelCounts[4]}
Số ngày mức 5 (Rất vui): ${levelCounts[5]}

--- Diễn biến ---
Mức cảm xúc trung bình nửa đầu: ${avgFirstHalf.toFixed(2)}
Mức cảm xúc trung bình nửa cuối: ${avgSecondHalf.toFixed(2)}
Xu hướng tổng thể: ${trendDescription}

--- Chi tiết từng ngày ---
${entries}

==> Dựa trên các thông tin trên, hãy phân tích ngắn gọn sức khỏe tinh thần trong giai đoạn này.
- Nếu cảm xúc chủ yếu tích cực (4–5) và có xu hướng tăng, hãy nhận định là tinh thần cải thiện.
- Nếu cảm xúc giảm hoặc có nhiều mức thấp, hãy đưa ra nhận xét phù hợp.
- Nếu ổn định, kết luận là ổn định.
Chỉ cần trả lời ngắn gọn trong 1–2 câu, không cần liệt kê lại chi tiết.
`;

    try {
        const response = await fetch('http://localhost:9999/api/analyze-mood', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: aiPrompt })
        });
        const data = await response.json();
        setAiAnalysis(data.result);
    } catch (error) {
        setAiAnalysis('Không thể kết nối AI lúc này.');
    }
};


        fetchChartData();
    }, [filterRange]);

    useEffect(() => {
        const fetchPaged = async () => {
            try {
                const res = await getMyMoodsPaged(currentPage, pageSize);
                setPagedMoods(res.data.moods);
                setTotalPages(res.data.totalPages);
            } catch (err) {
                console.error('Lỗi khi lấy mood phân trang:', err);
            }
        };

        fetchPaged();
    }, [currentPage]);

    return (
        <section className="section">
            <div className="container">
                <h3 className="text-center fw-bold mb-4">📈 Biểu đồ cảm xúc theo thời gian</h3>

                <div className="mb-4 text-end">
                    <select
                        className="form-select w-auto d-inline-block"
                        value={filterRange}
                        onChange={(e) => setFilterRange(e.target.value)}
                    >
                        <option value="7">7 ngày qua</option>
                        <option value="30">1 tháng qua</option>
                    </select>
                </div>

                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 80 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" angle={-30} textAnchor="end" interval={0} />
                        <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} allowDecimals={false}
                            tickFormatter={(tick) => ['Rất tệ', 'Tệ', 'Bình thường', 'Vui', 'Rất vui'][tick - 1]} />
                        <Tooltip formatter={(value) => [`Cảm xúc: ${['Rất tệ', 'Tệ', 'Bình thường', 'Vui', 'Rất vui'][value - 1]}`, 'Ngày']} labelFormatter={(label) => `Ngày: ${label}`} />
                        <Line type="monotone" dataKey="count" stroke="#4e73df" strokeWidth={3} activeDot={{ r: 6 }} />
                    </LineChart>
                </ResponsiveContainer>

                {aiAnalysis && (
                    <div className="mx-auto mt-4 p-4 border border-warning bg-warning-subtle text-dark rounded shadow-sm" style={{ maxWidth: 700 }}>
                        <h5 className="fw-bold mb-2 text-center">🧠 Phân tích biểu đồ</h5>
                        <p className="mb-0 text-center">{aiAnalysis}</p>
                    </div>
                )}

                

                <h3 className="mt-5 fw-bold">📖 Lịch sử cảm xúc</h3>
                <MentalAlertBox />
                <div className="table-responsive mt-3 p-3 border rounded bg-light shadow-sm">
                    <table className="table table-bordered table-hover align-middle text-center shadow-sm">
                        <thead className="table-light">
                            <tr>
                                <th>Ngày</th>
                                <th>Cảm xúc</th>
                                <th>Ghi chú</th>
                                <th>Gợi ý từ AI</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pagedMoods.map((mood, idx) => (
                                <tr key={idx}>
                                    <td>{moment(mood.date).format('DD/MM/YYYY')}</td>
                                    <td>{mood.moodLevel?.name || 'Không rõ'}</td>
                                    <td>{mood.note || '...'}</td>
                                    <td>{mood.aiSuggestion || '...'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="d-flex justify-content-center align-items-center mt-3 gap-3">
                    <button
                        className="btn btn-outline-primary"
                        onClick={() => setCurrentPage(p => Math.max(p - 1, 0))}
                        disabled={currentPage === 0}
                    >
                        ⬅️ Trước
                    </button>
                    <span>Trang {currentPage + 1} / {totalPages}</span>
                    <button
                        className="btn btn-outline-primary"
                        onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages - 1))}
                        disabled={currentPage >= totalPages - 1}
                    >
                        Tiếp ➡️
                    </button>
                </div>
            </div>
        </section>
    );
};

export default MoodHistoryPage;
