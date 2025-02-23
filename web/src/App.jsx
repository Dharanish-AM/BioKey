import { useSelector } from 'react-redux'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import AuthPage from './pages/AuthPage/AuthPage'
import Home from './pages/Home/Home'
import Header from './components/Header/Header'
import SideBar from './components/SideBar/SideBar'

function App() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)

  return (
    <Router>
      <div className="App">
        {
          isAuthenticated ?
            <div className='main-container'>
              <Header />
              <div className='main-row'>
                <SideBar />
                <div className='main-content'>
                  <Routes>
                    <Route
                      path="/"
                      element={<Home />}
                    />
                    <Route
                      path="*"
                      element={<Navigate to="/" />}
                    />
                  </Routes>
                </div>
              </div>
            </div> :
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="*" element={<Navigate to={"/auth"} />} />
            </Routes>
        }
      </div>
    </Router>
  )
}

export default App
