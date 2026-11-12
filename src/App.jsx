import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import ClassListPage from './pages/ClassListPage'
import ClassDetailPage from './pages/ClassDetailPage'
import ClassManagementPage from './pages/ClassManagementPage'
import './App.css'

function App() {
  return (
    <Router>
      <div className="coursera-app-wrapper">
        <Header />
        <main className="coursera-main-content">
          <Routes>
            <Route path="/" element={<ClassListPage />} />
            <Route path="/classes" element={<ClassListPage />} />
            <Route path="/classes/:id" element={<ClassDetailPage />} />
            <Route path="/manage-classes" element={<ClassManagementPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
