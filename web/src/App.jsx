import { useSelector } from 'react-redux'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
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
                    <Route path="/auth" element={<AuthPage />} />
                  </Routes>
                </div>
              </div>
            </div> :
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
            </Routes>
        }
      </div>
    </Router>
  )
}

export default App
