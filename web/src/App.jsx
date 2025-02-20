import { useSelector } from 'react-redux'
import './App.css'
import AuthPage from './pages/AuthPage/AuthPage'
import Home from './pages/Home/Home'

function App() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  return (
    <div className="App">
      {
        isAuthenticated ? <Home /> : <AuthPage />
      }
    </div>
  )
}

export default App
