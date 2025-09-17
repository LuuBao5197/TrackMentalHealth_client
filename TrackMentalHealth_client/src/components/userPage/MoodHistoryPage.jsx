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
                1: 'Very Bad', 2: 'Bad', 3: 'Neutral', 4: 'Good', 5: 'Very Good'
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

            // ✅ Trend Analysis
            let trendDescription = "";
            const diff = avgSecondHalf - avgFirstHalf;
            if (diff > 0.3) {
                trendDescription = "Mood is trending upward (lower at the beginning, higher at the end).";
            } else if (diff < -0.3) {
                trendDescription = "Mood is trending downward (higher at the beginning, lower at the end).";
            } else {
                trendDescription = "Mood is stable with no significant fluctuations.";
            }

            const entries = filtered.map(([date, level]) =>
                `Day ${moment(date).format('DD/MM')}: ${moodMap[level] || 'Unknown'} (level ${level})`
            ).join('\n');

            const aiPrompt = `
Here is the user's mood statistics for the past ${filterRange} days.
Mood Levels: 
1: Very Bad
2: Bad
3: Normal
4: Good
5: Very Good

--- Statistics ---
Days at level 1 (Very Bad): ${levelCounts[1]}
Days at level 2 (Bad): ${levelCounts[2]}
Days at level 3 (Normal): ${levelCounts[3]}
Days at level 4 (Good): ${levelCounts[4]}
Days at level 5 (Very Good): ${levelCounts[5]}

--- Trend ---
Average mood in first half: ${avgFirstHalf.toFixed(2)}
Average mood in second half: ${avgSecondHalf.toFixed(2)}
Overall trend: ${trendDescription}

--- Daily Details ---
${entries}

==> Based on the information above, provide a short analysis of the user's mental health during this period.
- If moods are mostly positive (4–5) and trending upward, conclude that the mental state is improving.
- If moods are decreasing or have many low levels, provide an appropriate remark.
- If stable, conclude that the mental state is stable.
Keep the answer short in 1–2 sentences, no need to list details again.
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
                setAiAnalysis('Unable to connect to AI at the moment.');
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
                console.error('Error fetching paged moods:', err);
            }
        };

        fetchPaged();
    }, [currentPage]);
    
    return (
        <section className="section">
            <div className="container">
                <h3 className="text-center fw-bold mb-4">📈 Mood Chart Over Time</h3>

                <div className="mb-4 text-end">
                    <select
                        className="form-select w-auto d-inline-block"
                        value={filterRange}
                        onChange={(e) => setFilterRange(e.target.value)}
                    >
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                    </select>
                </div>

                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 80 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" angle={-30} textAnchor="end" interval={0} />
                        <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} allowDecimals={false}
                            tickFormatter={(tick) => ['Very Bad', 'Bad', 'Neutral', 'Good', 'Very Good'][tick - 1]} />
                        <Tooltip formatter={(value) => [`Mood: ${['Very Bad', 'Bad', 'Neutral', 'Good', 'Very Good'][value - 1]}`, 'Day']} labelFormatter={(label) => `Day: ${label}`} />
                        <Line type="monotone" dataKey="count" stroke="#4e73df" strokeWidth={3} activeDot={{ r: 6 }} />
                    </LineChart>
                </ResponsiveContainer>

                {aiAnalysis && (
                    <div className="mx-auto mt-4 p-4 border border-warning bg-warning-subtle text-dark rounded shadow-sm" style={{ maxWidth: 700 }}>
                        <h5 className="fw-bold mb-2 text-center">🧠 AI Analysis</h5>
                        <p className="mb-0 text-center">{aiAnalysis}</p>
                    </div>
                )}

                <h3 className="mt-5 fw-bold">📖 Mood History</h3>
                <MentalAlertBox />
                <div className="table-responsive mt-3 p-3 border rounded bg-light shadow-sm">
                    <table className="table table-bordered table-hover align-middle text-center shadow-sm">
                        <thead className="table-light">
                            <tr>
                                <th>Date</th>
                                <th>Mood</th>
                                <th>Note</th>
                                <th>AI Suggestion</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pagedMoods.map((mood, idx) => (
                                <tr key={idx}>
                                    <td>{moment(mood.date).format('DD/MM/YYYY')}</td>
                                    <td>{mood.moodLevel?.name || 'Unknown'}</td>
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
                        ⬅️ Previous
                    </button>
                    <span>Page {currentPage + 1} / {totalPages}</span>
                    <button
                        className="btn btn-outline-primary"
                        onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages - 1))}
                        disabled={currentPage >= totalPages - 1}
                    >
                        Next ➡️
                    </button>
                </div>
            </div>
        </section>
    );
};
export default MoodHistoryPage;
