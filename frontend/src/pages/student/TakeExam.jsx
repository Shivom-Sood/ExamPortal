import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiRequest } from '../../api.js';

// 125 seconds -> "2:05"
const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return min + ':' + (sec < 10 ? '0' + sec : sec);
}

const TakeExam = () => {
    const { examId } = useParams();
    const navigate = useNavigate();

    const [exam, setExam] = useState(null);
    const [attemptId, setAttemptId] = useState('');
    const [questions, setQuestions] = useState([]);
    const [endsAt, setEndsAt] = useState(null);
    const [secondsLeft, setSecondsLeft] = useState(0);
    const [answers, setAnswers] = useState({});
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // useRef: values that do not need a re-render
    const hasStarted = useRef(false);
    const hasSubmitted = useRef(false);
    const answersRef = useRef({});
    const attemptIdRef = useRef('');

    // 1. start (or continue) the exam when the page opens
    useEffect(() => {
        // React runs effects twice in development, so we start only once
        if (hasStarted.current) {
            return;
        }
        hasStarted.current = true;

        const startExam = async () => {
            try {
                const data = await apiRequest('/api/attempts/start/' + examId, 'POST');
                setExam(data.exam);
                setAttemptId(data.attemptId);
                attemptIdRef.current = data.attemptId;
                setQuestions(data.questions);
                setEndsAt(data.endsAt);

                // if the page was refreshed, load the answers saved in the browser
                const saved = localStorage.getItem('answers_' + data.attemptId);
                if (saved) {
                    const savedAnswers = JSON.parse(saved);
                    setAnswers(savedAnswers);
                    answersRef.current = savedAnswers;
                }
            } catch (err) {
                setError(err.message);
            }
        }
        startExam();
    }, [examId]);

    // 2. submit answers (button, or automatically when time is over)
    const submitExam = async () => {
        if (hasSubmitted.current) {
            return;
        }
        hasSubmitted.current = true;
        setSubmitting(true);

        // change { questionId: option } into [{ question, selectedOption }]
        const answerList = [];
        for (const questionId in answersRef.current) {
            answerList.push({ question: questionId, selectedOption: answersRef.current[questionId] });
        }

        try {
            await apiRequest('/api/attempts/' + attemptIdRef.current + '/submit', 'POST', { answers: answerList });
            localStorage.removeItem('answers_' + attemptIdRef.current);
            navigate('/student/result/' + attemptIdRef.current);
        } catch (err) {
            setError(err.message);
            setSubmitting(false);
        }
    }

    // 3. countdown timer, runs every second
    useEffect(() => {
        if (!endsAt) {
            return;
        }

        const updateTimer = () => {
            const left = Math.floor((new Date(endsAt).getTime() - Date.now()) / 1000);
            if (left <= 0) {
                setSecondsLeft(0);
                clearInterval(timer);
                submitExam(); // time over -> auto submit
            } else {
                setSecondsLeft(left);
            }
        }

        const timer = setInterval(updateTimer, 1000);
        updateTimer();

        return () => clearInterval(timer);
    }, [endsAt]);

    const handleSelect = (questionId, optionIndex) => {
        const updated = { ...answers, [questionId]: optionIndex };
        setAnswers(updated);
        answersRef.current = updated;
        // save in the browser, so a page refresh does not lose the answers
        localStorage.setItem('answers_' + attemptIdRef.current, JSON.stringify(updated));
    }

    const handleSubmitClick = () => {
        const notAnswered = questions.length - Object.keys(answers).length;
        let message = 'Submit the exam? You cannot change answers after this.';
        if (notAnswered > 0) {
            message = 'You have ' + notAnswered + ' unanswered question(s). Submit anyway?';
        }
        if (window.confirm(message)) {
            submitExam();
        }
    }

    if (error) {
        return (
            <div className="card">
                <div className="error">{error}</div>
                <Link to="/student">Back to exams</Link>
            </div>
        );
    }

    if (!exam) {
        return <p>Starting exam...</p>;
    }

    return (
        <div>
            <div className={secondsLeft < 60 ? 'timer low' : 'timer'}>
                <span>{exam.title}</span>
                <span>Time left: {formatTime(secondsLeft)}</span>
            </div>

            <p className="muted">
                Answered {Object.keys(answers).length} of {questions.length} | Total marks: {exam.totalMarks}
            </p>

            {questions.map((question, qIndex) => (
                <div className="card" key={question._id}>
                    <p>
                        <b>Q{qIndex + 1}. {question.text}</b>{' '}
                        <span className="muted">({question.marks} mark{question.marks > 1 ? 's' : ''})</span>
                    </p>

                    {question.options.map((option, oIndex) => (
                        <label className="option" key={oIndex}>
                            <input
                                type="radio"
                                name={question._id}
                                checked={answers[question._id] === oIndex}
                                onChange={() => handleSelect(question._id, oIndex)}
                            />
                            {option}
                        </label>
                    ))}
                </div>
            ))}

            <button className="success" onClick={handleSubmitClick} disabled={submitting || !attemptId}>
                {submitting ? 'Submitting...' : 'Submit Exam'}
            </button>
        </div>
    );
}

export default TakeExam;