import { useEffect, useState } from 'react';
import { apiRequest } from '../../api.js';

const AdminDashboard = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadOverview = async () => {
            try {
                const overview = await apiRequest('/api/reports/overview');
                setData(overview);
            } catch (err) {
                setError(err.message);
            }
        }
        loadOverview();
    }, []);

    // usersByRole looks like [{ _id: 'student', count: 4 }, ...]
    const countRole = (role) => {
        const row = data.usersByRole.find((item) => item._id === role);
        return row ? row.count : 0;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    if (!data) {
        return <p>Loading overview...</p>;
    }

    return (
        <div>
            <h2>Admin Overview</h2>

            <div className="grid">
                <div className="card stat">
                    <p className="muted">Students</p>
                    <h2>{countRole('student')}</h2>
                </div>
                <div className="card stat">
                    <p className="muted">Teachers</p>
                    <h2>{countRole('teacher')}</h2>
                </div>
                <div className="card stat">
                    <p className="muted">Admins</p>
                    <h2>{countRole('admin')}</h2>
                </div>
                <div className="card stat">
                    <p className="muted">Questions</p>
                    <h2>{data.totalQuestions}</h2>
                </div>
                <div className="card stat">
                    <p className="muted">Exams (published)</p>
                    <h2>{data.totalExams} ({data.publishedExams})</h2>
                </div>
            </div>

            <div className="card">
                <h3>Exam performance</h3>
                {data.examSummary.length === 0 ? (
                    <p className="muted">No exam has been attempted yet.</p>
                ) : (
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Exam</th>
                                    <th>Subject</th>
                                    <th>Attempts</th>
                                    <th>Average</th>
                                    <th>Pass %</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.examSummary.map((exam) => (
                                    <tr key={exam.examId}>
                                        <td>{exam.title}</td>
                                        <td>{exam.subject}</td>
                                        <td>{exam.totalAttempts}</td>
                                        <td>{exam.averageScore} / {exam.totalMarks}</td>
                                        <td>{exam.passPercentage}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;