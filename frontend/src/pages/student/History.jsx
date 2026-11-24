import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../api.js';

const History = () => {
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadAttempts = async () => {
            try {
                const data = await apiRequest('/api/attempts/my');
                setAttempts(data.attempts);
            } catch (err) {
                setError(err.message);
            }
            setLoading(false);
        }
        loadAttempts();
    }, []);

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <h2>My Results</h2>
            {error && <div className="error">{error}</div>}

            {attempts.length === 0 ? (
                <p className="muted">You have not attempted any exam yet.</p>
            ) : (
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Exam</th>
                                <th>Subject</th>
                                <th>Score</th>
                                <th>Result</th>
                                <th>Date</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {attempts.map((attempt) => (
                                <tr key={attempt._id}>
                                    <td>{attempt.exam ? attempt.exam.title : 'Deleted exam'}</td>
                                    <td>{attempt.exam ? attempt.exam.subject : '-'}</td>
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
                                    <td>{new Date(attempt.startedAt).toLocaleDateString()}</td>
                                    <td>
                                        {attempt.status === 'submitted' && (
                                            <Link to={'/student/result/' + attempt._id}>View</Link>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default History;