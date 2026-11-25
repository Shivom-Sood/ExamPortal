import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../api.js';

const TeacherDashboard = () => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const loadExams = async () => {
        try {
            const data = await apiRequest('/api/exams');
            setExams(data.exams);
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    }

    useEffect(() => {
        loadExams();
    }, []);

    const togglePublish = async (exam) => {
        setError('');
        setSuccess('');
        try {
            await apiRequest('/api/exams/' + exam._id + '/publish', 'PATCH', { isPublished: !exam.isPublished });
            setSuccess(exam.isPublished ? 'Exam unpublished' : 'Exam published - students can see it now');
            loadExams();
        } catch (err) {
            setError(err.message);
        }
    }

    const handleDelete = async (exam) => {
        if (!window.confirm('Delete "' + exam.title + '"?')) {
            return;
        }
        setError('');
        setSuccess('');
        try {
            await apiRequest('/api/exams/' + exam._id, 'DELETE');
            setSuccess('Exam deleted');
            loadExams();
        } catch (err) {
            setError(err.message);
        }
    }

    if (loading) {
        return <p>Loading exams...</p>;
    }

    return (
        <div>
            <div className="row" style={{ justifyContent: 'space-between' }}>
                <h2>My Exams</h2>
                <Link to="/teacher/exams/new"><button>+ Create Exam</button></Link>
            </div>

            {error && <div className="error">{error}</div>}
            {success && <div className="success-msg">{success}</div>}

            {exams.length === 0 ? (
                <p className="muted">No exams yet. Add questions in the Question Bank, then create an exam.</p>
            ) : (
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Subject</th>
                                <th>Questions</th>
                                <th>Marks (pass)</th>
                                <th>Time</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {exams.map((exam) => (
                                <tr key={exam._id}>
                                    <td>{exam.title}</td>
                                    <td>{exam.subject}</td>
                                    <td>{exam.questions.length}</td>
                                    <td>{exam.totalMarks} ({exam.passMarks})</td>
                                    <td>{exam.duration} min</td>
                                    <td>
                                        <span className={exam.isPublished ? 'badge pass' : 'badge draft'}>
                                            {exam.isPublished ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="row">
                                            <button className="secondary" onClick={() => togglePublish(exam)}>
                                                {exam.isPublished ? 'Unpublish' : 'Publish'}
                                            </button>
                                            <Link to={'/teacher/exams/' + exam._id + '/results'}>
                                                <button>Results</button>
                                            </Link>
                                            <button className="danger" onClick={() => handleDelete(exam)}>Delete</button>
                                        </div>
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

export default TeacherDashboard;