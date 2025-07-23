import React, { useEffect, useState } from 'react';
import { getMyMoods, getMoodStatistics } from '../../api/moodAPI';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import MentalAlertBox from '../../api/MentalAlertBox';
import moment from 'moment';

const MoodHistoryPage = () => {
    const [chartData, setChartData] = useState([]);
    const [moods, setMoods] = useState([]);
    const [aiAnalysis, setAiAnalysis] = useState('');
    const [filterRange, setFilterRange] = useState('7'); // ✅ THÊM state lọc

    useEffect(() => {
        const fetchData = async () => {
            const res = await getMoodStatistics();
            const raw = res.data;
            const now = moment();

            const filtered = Object.entries(raw).filter(([key]) => {
                const date = moment(key);
                return now.diff(date, 'days') <= (filterRange === '7' ? 7 : 30);
            });

            const formatted = filtered
  .map(([dateStr, value]) => ({
    rawDate: moment(dateStr), // dùng để sort
    date: moment(dateStr).format("DD/MM"),
    count: value
  }))
  .sort((a, b) => a.rawDate - b.rawDate); // sắp xếp tăng dần

setChartData(formatted.map(({ date, count }) => ({ date, count })));


            setChartData(formatted);

            // 🔍 Tự động phân tích bằng AI khi biểu đồ cập nhật
            const entries = filtered.map(([date, level]) =>
                `Ngày ${moment(date).format('DD/MM')}: mức ${level}`
            ).join('\n');

           const aiPrompt = `Đây là biểu đồ cảm xúc của người dùng trong ${filterRange === '7' ? '7 ngày' : '30 ngày'} gần nhất:\n${entries}\n
Hãy phân tích và trả lời ngắn gọn xem sức khỏe tinh thần người dùng có ổn không (ví dụ: "ổn định", "không ổn", "có dấu hiệu căng thẳng", ...). Không cần đưa ra giải pháp.`;

            try {
                const response = await fetch('/api/ai/analyze-mood', {
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

        fetchData();
        getMyMoods().then(res => setMoods(res.data));
    }, [filterRange]);

    return (
        <section className="section">
            <div className="container">

                <h3 className="text-center fw-bold mb-4">📈 Biểu đồ cảm xúc theo thời gian</h3>

                {/* 🔽 Dropdown chọn lọc thời gian */}
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
                    <LineChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 0, bottom: 80 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" angle={-30} textAnchor="end" interval={0} />
                        <YAxis
                            type="number"
                            domain={[1, 5]}
                            ticks={[1, 2, 3, 4, 5]}
                            allowDecimals={false}
                            tickFormatter={(tick) => {
                                switch (tick) {
                                    case 1: return "Rất tệ";
                                    case 2: return "Tệ";
                                    case 3: return "Bình thường";
                                    case 4: return "Vui";
                                    case 5: return "Rất vui";
                                    default: return tick;
                                }
                            }}
                        />
                        <Tooltip
                            formatter={(value) => {
                                const moodLabel = {
                                    1: 'Rất tệ',
                                    2: 'Tệ',
                                    3: 'Bình thường',
                                    4: 'Vui',
                                    5: 'Rất vui'
                                }[value] || value;
                                return [`Cảm xúc: ${moodLabel}`, 'Ngày'];
                            }}
                            labelFormatter={(label) => `Ngày: ${label}`}
                        />
                        <Line
                            type="monotone"
                            dataKey="count"
                            stroke="#4e73df"
                            strokeWidth={3}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>

                {/* 🧠 Phân tích AI hiện dưới biểu đồ */}
                {aiAnalysis && (
                    <div className="alert alert-warning mt-4 text-center">
                        <strong>Phân tích biểu đồ:</strong><br />
                        {aiAnalysis}
                    </div>
                )}

                <MentalAlertBox />

                <h3 className="mt-5 fw-bold">📖 Lịch sử cảm xúc</h3>
                <div className="table-responsive mt-3">
                    <table className="table table-bordered table-hover">
                        <thead className="table-light">
                            <tr>
                                <th>Ngày</th>
                                <th>Cảm xúc</th>
                                <th>Ghi chú</th>
                                <th>Gợi ý từ AI</th>
                            </tr>
                        </thead>
                        <tbody>
                            {moods.map((mood, idx) => (
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
            </div>
        </section>
    );
};

export default MoodHistoryPage;
