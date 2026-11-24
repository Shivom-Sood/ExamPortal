import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api.js';
import { useAuth } from '../../context/AuthContext.jsx';

const StudentDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [exams, setExams] = useState([]);
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                const examData = await apiRequest('/api/exams');
                const attemptData = await apiRequest('/api/attempts/my');
                setExams(examData.exams);
                setAttempts(attemptData.attempts);
            } catch (err) {
                setError(err.message);
            }
            setLoading(false);
        }
        loadData();
    }, []);

    // finds this student's attempt for an exam (if any)
    const findAttempt = (examId) => {
        return attempts.find((attempt) => attempt.exam && attempt.exam._id === examId);
    }

    const handleStart = (exam) => {
        const ok = window.confirm('The timer (' + exam.duration + ' min) starts as soon as you begin. Start now?');
        if (ok) {
            navigate('/student/exam/' + exam._id);
        }
    }

    if (loading) {
        return <p>Loading exams...</p>;
    }

    return (
        <div>
            <h2>Welcome, {user.name}</h2>
            {error && <div className="error">{error}</div>}

            {exams.length === 0 && <p className="muted">No exams available right now.</p>}

            <div className="grid">
                {exams.map((exam) => {
                    const attempt = findAttempt(exam._id);

                    return (
                        <div className="card" key={exam._id}>
                            <h3>{exam.title}</h3>
                            <p className="muted">
                                {exam.subject} | {exam.questions.length} questions | {exam.duration} min
                            </p>
                            <p className="muted">
                                Total marks: {exam.totalMarks} | Pass marks: {exam.passMarks}
                            </p>

                            {!attempt && (
                                <button onClick={() => handleStart(exam)}>Start Exam</button>
                            )}

                            {attempt && attempt.status === 'in-progress' && (
                                <button className="success" onClick={() => navigate('/student/exam/' + exam._id)}>
                                    Continue Exam
                                </button>
                            )}

                            {attempt && attempt.status === 'submitted' && (
                                <div className="row">
                                    <span>Score: {attempt.score}/{attempt.totalMarks}</span>
                                    <span className={attempt.passed ? 'badge pass' : 'badge fail'}>
                                        {attempt.passed ? 'Passed' : 'Failed'}
                                    </span>
                                    <Link to={'/student/result/' + attempt._id}>View Result</Link>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default StudentDashboard;