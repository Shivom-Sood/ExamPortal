import { Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import StudentDashboard from './pages/student/StudentDashboard.jsx';
import TakeExam from './pages/student/TakeExam.jsx';
import Result from './pages/student/Result.jsx';
import History from './pages/student/History.jsx';
import TeacherDashboard from './pages/teacher/TeacherDashboard.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';

function App() {
    return (
        <>
            <Navbar />
            <div className="container">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* student */}
                    <Route path="/student" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
                    <Route path="/student/exam/:examId" element={<ProtectedRoute role="student"><TakeExam /></ProtectedRoute>} />
                    <Route path="/student/result/:attemptId" element={<ProtectedRoute role="student"><Result /></ProtectedRoute>} />
                    <Route path="/student/history" element={<ProtectedRoute role="student"><History /></ProtectedRoute>} />

                    {/* teacher */}
                    <Route path="/teacher" element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>} />

                    {/* admin */}
                    <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />

                    <Route path="*" element={
                        <div className="card">
                            <h2>Page not found</h2>
                            <Link to="/">Go home</Link>
                        </div>
                    } />
                </Routes>
            </div>
        </>
    );
}

export default App;