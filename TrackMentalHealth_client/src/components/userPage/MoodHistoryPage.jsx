import React, { useEffect, useState } from 'react';
import { getMyMoods, getMoodStatistics } from '../../api/moodAPI';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import moment from 'moment';

const MoodHistoryPage = () => {
    const [chartData, setChartData] = useState([]);
    const [moods, setMoods] = useState([]);

    useEffect(() => {
        // Lấy thống kê biểu đồ cảm xúc
        getMoodStatistics().then(res => {
            const raw = res.data;
            const formatted = Object.entries(raw).map(([key, value]) => {
                const [dateStr, moodName] = key.split(" - ");
                return {
                    date: moment(dateStr).format("DD/MM"), // Định dạng ngày đẹp hơn
                    mood: moodName || 'Không rõ',
                    count: value
                };
            });
            setChartData(formatted);
        });

        // Lấy lịch sử cảm xúc chi tiết
        getMyMoods().then(res => setMoods(res.data));
    }, []);

    return (
        <section className="section">
            <div className="container">
                <h3 className="text-center fw-bold mb-4">📈 Biểu đồ cảm xúc theo thời gian</h3>
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
