function App() {
    return (
        <div className="container">
            <div className="card">
                <h1>ExamPortal</h1>
                <p>Frontend is working ✅</p>
                <p className="muted">API: {import.meta.env.VITE_API_URL}</p>
            </div>
        </div>
    );
}

export default App;