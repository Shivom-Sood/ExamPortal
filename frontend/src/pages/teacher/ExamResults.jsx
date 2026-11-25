import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiRequest } from '../../api.js';

const ExamResults = () => {
    const { examId } = useParams();

    const [report, setReport] = useState(null);
    const [attempts, setAttempts] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                // report = aggregation from the backend
                const reportData = await apiRequest('/api/reports/exam/' + examId);
                const attemptData = await apiRequest('/api/attempts/exam/' + examId);
                setReport(reportData);
                setAttempts(attemptData.attempts);
            } catch (err) {
                setError(err.message);
            }
        }
        loadData();
    }, [examId]);

    if (error) {
        return <div className="error">{error}</div>;
    }

    if (!report) {
        return <p>Loading results...</p>;
    }

    const summary = report.summary;

    return (
        <div>
            <Link to="/teacher">← Back to My Exams</Link>
            <h2>{report.exam.title}</h2>
            <p className="muted">
                {report.exam.subject} | Total marks: {report.exam.totalMarks} | Pass marks: {report.exam.passMarks}
            </p>

            {/* class performance (aggregation) */}
            <div className="grid">
                <div className="card stat">
                    <p className="muted">Attempts</p>
                    <h2>{summary.totalAttempts}</h2>
                </div>
                <div className="card stat">
                    <p className="muted">Average</p>
                    <h2>{summary.averageScore}</h2>
                </div>
                <div className="card stat">
                    <p className="muted">Highest</p>
                    <h2>{summary.highestScore}</h2>
                </div>
                <div className="card stat">
                    <p className="muted">Lowest</p>
                    <h2>{summary.lowestScore}</h2>
                </div>
                <div className="card stat">
                    <p className="muted">Pass %</p>
                    <h2>{summary.passPercentage}%</h2>
                </div>
            </div>

            {/* students */}
            <div className="card">
                <h3>Students</h3>
                {attempts.length === 0 ? (
                    <p className="muted">No student has attempted this exam yet.</p>
                ) : (
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Email</th>
                                    <th>Score</th>
                                    <th>Result</th>
                                    <th>Submitted</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {attempts.map((attempt) => (
                                    <tr key={attempt._id}>
                                        <td>{attempt.student ? attempt.student.name : 'Deleted user'}</td>
                                        <td>{attempt.student ? attempt.student.email : '-'}</td>
                                        <td>{attempt.status === 'submitted' ? attempt.score + '/' + attempt.totalMarks : '-'}</td>
                                        <td>
                                            {attempt.status === 'submitted' ? (
                                                <span className={attempt.passed ? 'badge pass' : 'badge fail'}>
                                                    {attempt.passed ? 'Passed' : 'Failed'}
                                                </span>
                                            ) : (
                                                <span className="badge draft">In progress</span>
                                            )}
                                        </td>
                                        <td>{attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : '-'}</td>
                                        <td>
                                            {attempt.status === 'submitted' && (
                                                <Link to={'/teacher/result/' + attempt._id}>View answers</Link>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* question analysis */}
            <div className="card">
                <h3>Question analysis (hardest first)</h3>
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Question</th>
                                <th>Correct answers</th>
                                <th>Correct %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {report.questionStats.map((question) => (
                                <tr key={question._id}>
                                    <td>{question.text}</td>
                                    <td>{question.correctCount}</td>
                                    <td>{question.correctPercentage}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default ExamResults;