import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiRequest } from '../../api.js';

const Result = () => {
    const { attemptId } = useParams();

    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadResult = async () => {
            try {
                const data = await apiRequest('/api/attempts/' + attemptId);
                setResult(data.result);
            } catch (err) {
                setError(err.message);
            }
        }
        loadResult();
    }, [attemptId]);

    // green for the correct option, red for a wrong choice
    const getOptionClass = (question, index) => {
        if (index === question.correctOption) {
            return 'option correct';
        }
        if (index === question.selectedOption) {
            return 'option wrong';
        }
        return 'option';
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    if (!result) {
        return <p>Loading result...</p>;
    }

    return (
        <div>
            <div className="card">
                <h2>{result.exam.title}</h2>
                <p className="muted">{result.exam.subject}</p>
                <h3>
                    Score: {result.score} / {result.totalMarks}{' '}
                    <span className={result.passed ? 'badge pass' : 'badge fail'}>
                        {result.passed ? 'Passed' : 'Failed'}
                    </span>
                </h3>
                <p className="muted">
                    Pass marks: {result.exam.passMarks} | Submitted: {new Date(result.submittedAt).toLocaleString()}
                </p>
            </div>

            {result.questions.map((question, qIndex) => (
                <div className="card" key={question._id}>
                    <p>
                        <b>Q{qIndex + 1}. {question.text}</b>{' '}
                        <span className="muted">({question.marks} mark{question.marks > 1 ? 's' : ''})</span>
                    </p>

                    {question.options.map((option, oIndex) => (
                        <div className={getOptionClass(question, oIndex)} key={oIndex}>
                            {option}
                            {oIndex === question.selectedOption && ' (your answer)'}
                        </div>
                    ))}

                    {question.selectedOption === null && <p className="muted">Not answered</p>}
                </div>
            ))}

            <Link to="/student">Back to exams</Link>
        </div>
    );
}

export default Result;