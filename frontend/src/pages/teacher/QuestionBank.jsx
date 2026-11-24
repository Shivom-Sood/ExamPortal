import { useEffect, useState } from 'react';
import { apiRequest } from '../../api.js';

const emptyForm = {
    text: '',
    options: ['', '', '', ''],
    correctOption: 0,
    marks: 1,
    subject: ''
};

const QuestionBank = () => {
    const [questions, setQuestions] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    // search filters
    const [search, setSearch] = useState('');
    const [subject, setSubject] = useState('');

    // add / edit form
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);

    const loadQuestions = async (pageNumber) => {
        setLoading(true);
        setError('');
        try {
            let url = '/api/questions?limit=5&page=' + pageNumber;
            if (search) {
                url = url + '&search=' + encodeURIComponent(search);
            }
            if (subject) {
                url = url + '&subject=' + encodeURIComponent(subject);
            }

            const data = await apiRequest(url);
            setQuestions(data.questions);
            setPage(data.page);
            setTotalPages(data.totalPages || 1);
            setTotal(data.total);
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    }

    // load page 1 when the page opens
    useEffect(() => {
        loadQuestions(1);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        loadQuestions(1);
    }

    const handleClearSearch = () => {
        setSearch('');
        setSubject('');
        // load without filters
        apiRequest('/api/questions?limit=5&page=1').then((data) => {
            setQuestions(data.questions);
            setPage(data.page);
            setTotalPages(data.totalPages || 1);
            setTotal(data.total);
        });
    }

    // ---------- form ----------
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    const handleOptionChange = (index, value) => {
        const newOptions = [...form.options];
        newOptions[index] = value;
        setForm({ ...form, options: newOptions });
    }

    const openAddForm = () => {
        setForm(emptyForm);
        setEditingId(null);
        setShowForm(true);
        setSuccess('');
    }

    const openEditForm = (question) => {
        setForm({
            text: question.text,
            options: [...question.options],
            correctOption: question.correctOption,
            marks: question.marks,
            subject: question.subject
        });
        setEditingId(question._id);
        setShowForm(true);
        setSuccess('');
        window.scrollTo(0, 0);
    }

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setForm(emptyForm);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const body = {
            text: form.text,
            options: form.options,
            correctOption: Number(form.correctOption),
            marks: Number(form.marks),
            subject: form.subject
        };

        try {
            if (editingId) {
                await apiRequest('/api/questions/' + editingId, 'PUT', body);
                setSuccess('Question updated');
            } else {
                await apiRequest('/api/questions', 'POST', body);
                setSuccess('Question added');
            }
            closeForm();
            loadQuestions(editingId ? page : 1);
        } catch (err) {
            setError(err.message);
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this question?')) {
            return;
        }
        setError('');
        setSuccess('');
        try {
            await apiRequest('/api/questions/' + id, 'DELETE');
            setSuccess('Question deleted');
            loadQuestions(1);
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div>
            <div className="row" style={{ justifyContent: 'space-between' }}>
                <h2>Question Bank ({total})</h2>
                {!showForm && <button onClick={openAddForm}>+ Add Question</button>}
            </div>

            {error && <div className="error">{error}</div>}
            {success && <div className="success-msg">{success}</div>}

            {/* add / edit form */}
            {showForm && (
                <div className="card">
                    <h3>{editingId ? 'Edit Question' : 'Add Question'}</h3>
                    <form onSubmit={handleSubmit}>
                        <label>Question</label>
                        <textarea name="text" rows="2" value={form.text} onChange={handleChange} required />

                        <label>Options (select the correct one)</label>
                        {form.options.map((option, index) => (
                            <div className="row" key={index} style={{ marginBottom: '8px' }}>
                                <input
                                    type="radio"
                                    name="correctOption"
                                    style={{ width: 'auto' }}
                                    checked={Number(form.correctOption) === index}
                                    onChange={() => setForm({ ...form, correctOption: index })}
                                />
                                <input
                                    type="text"
                                    placeholder={'Option ' + (index + 1)}
                                    value={option}
                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                    required
                                    style={{ flex: 1, width: 'auto' }}
                                />
                            </div>
                        ))}

                        <div className="row">
                            <div style={{ flex: 1 }}>
                                <label>Marks</label>
                                <input type="number" name="marks" min="1" value={form.marks} onChange={handleChange} required />
                            </div>
                            <div style={{ flex: 2 }}>
                                <label>Subject</label>
                                <input type="text" name="subject" value={form.subject} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="row mt">
                            <button type="submit">{editingId ? 'Update' : 'Add'}</button>
                            <button type="button" className="secondary" onClick={closeForm}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* search */}
            <form className="card row" onSubmit={handleSearch}>
                <input
                    type="text"
                    placeholder="Search question text..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ flex: 2, width: 'auto' }}
                />
                <input
                    type="text"
                    placeholder="Subject (e.g. JavaScript)"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    style={{ flex: 1, width: 'auto' }}
                />
                <button type="submit">Search</button>
                <button type="button" className="secondary" onClick={handleClearSearch}>Clear</button>
            </form>

            {/* list */}
            {loading ? (
                <p>Loading...</p>
            ) : questions.length === 0 ? (
                <p className="muted">No questions found.</p>
            ) : (
                questions.map((question) => (
                    <div className="card" key={question._id}>
                        <p><b>{question.text}</b></p>
                        <p className="muted">{question.subject} | {question.marks} mark(s)</p>
                        <ol type="A">
                            {question.options.map((option, index) => (
                                <li key={index} style={index === question.correctOption ? { color: '#16a34a', fontWeight: 'bold' } : {}}>
                                    {option} {index === question.correctOption && '✔'}
                                </li>
                            ))}
                        </ol>
                        <div className="row">
                            <button className="secondary" onClick={() => openEditForm(question)}>Edit</button>
                            <button className="danger" onClick={() => handleDelete(question._id)}>Delete</button>
                        </div>
                    </div>
                ))
            )}

            {/* pagination */}
            <div className="row">
                <button className="secondary" disabled={page <= 1} onClick={() => loadQuestions(page - 1)}>
                    Previous
                </button>
                <span>Page {page} of {totalPages}</span>
                <button className="secondary" disabled={page >= totalPages} onClick={() => loadQuestions(page + 1)}>
                    Next
                </button>
            </div>
        </div>
    );
}

export default QuestionBank;