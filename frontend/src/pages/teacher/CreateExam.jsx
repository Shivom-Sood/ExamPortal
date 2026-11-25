import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api.js';

const CreateExam = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({ title: '', subject: '', duration: 10, passMarks: 1 });
    const [questions, setQuestions] = useState([]);
    const [selected, setSelected] = useState([]); // ids of ticked questions
    const [filter, setFilter] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // load this teacher's questions
    useEffect(() => {
        const loadQuestions = async () => {
            try {
                const data = await apiRequest('/api/questions?limit=100');
                setQuestions(data.questions);
            } catch (err) {
                setError(err.message);
            }
            setLoading(false);
        }
        loadQuestions();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    // tick / untick a question
    const toggleQuestion = (id) => {
        if (selected.includes(id)) {
            setSelected(selected.filter((questionId) => questionId !== id));
        } else {
            setSelected([...selected, id]);
        }
    }

    // total marks of the ticked questions (the server also calculates this)
    let totalMarks = 0;
    for (const question of questions) {
        if (selected.includes(question._id)) {
            totalMarks = totalMarks + question.marks;
        }
    }

    // questions shown after the subject filter
    const shownQuestions = questions.filter((question) =>
        question.subject.toLowerCase().includes(filter.toLowerCase())
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (selected.length === 0) {
            setError('Please select at least one question');
            return;
        }

        setSaving(true);
        try {
            await apiRequest('/api/exams', 'POST', {
                title: form.title,
                subject: form.subject,
                duration: Number(form.duration),
                passMarks: Number(form.passMarks),
                questions: selected
            });
            navigate('/teacher');
        } catch (err) {
            setError(err.message);
            setSaving(false);
        }
    }

    if (loading) {
        return <p>Loading questions...</p>;
    }

    return (
        <div>
            <h2>Create Exam</h2>
            {error && <div className="error">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="card">
                    <label>Title</label>
                    <input type="text" name="title" value={form.title} onChange={handleChange} required />

                    <label>Subject</label>
                    <input type="text" name="subject" value={form.subject} onChange={handleChange} required />

                    <div className="row">
                        <div style={{ flex: 1 }}>
                            <label>Duration (minutes)</label>
                            <input type="number" name="duration" min="1" value={form.duration} onChange={handleChange} required />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label>Pass marks</label>
                            <input type="number" name="passMarks" min="0" value={form.passMarks} onChange={handleChange} required />
                        </div>
                    </div>
                    <p className="muted">The exam is saved as a draft. Publish it from My Exams when it is ready.</p>
                </div>

                <div className="card">
                    <div className="row" style={{ justifyContent: 'space-between' }}>
                        <h3>Select questions</h3>
                        <b>Selected: {selected.length} | Total marks: {totalMarks}</b>
                    </div>

                    <input
                        type="text"
                        placeholder="Filter by subject..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />

                    {questions.length === 0 && (
                        <p className="muted">
                            No questions yet. <Link to="/teacher/questions">Add questions first</Link>
                        </p>
                    )}

                    {shownQuestions.map((question) => (
                        <label className="option" key={question._id}>
                            <input
                                type="checkbox"
                                checked={selected.includes(question._id)}
                                onChange={() => toggleQuestion(question._id)}
                            />
                            {question.text}{' '}
                            <span className="muted">({question.subject}, {question.marks} mark{question.marks > 1 ? 's' : ''})</span>
                        </label>
                    ))}
                </div>

                <div className="row">
                    <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Create Exam'}</button>
                    <Link to="/teacher"><button type="button" className="secondary">Cancel</button></Link>
                </div>
            </form>
        </div>
    );
}

export default CreateExam;