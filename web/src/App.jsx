import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './App.css';
import AuthPage from './pages/AuthPage/AuthPage';
import Home from './pages/Home/Home';
import Header from './components/Header/Header';
import SideBar from './components/SideBar/SideBar';
import { loadUser } from './services/userOperations';
import { checkTokenIsValid } from './services/authOperations';
import Lottie from "lottie-react";

import LoadingAnimation from './assets/animations/loading.json';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthState, setUser } from './redux/actions';
import Folder from './pages/Folders/Folders';
import Folders from './pages/Folders/Folders';
import Favourites from './pages/Favourites/Favourites';
import Trash from './pages/Trash/Trash';
import Images from './pages/media/Images/Images';
import Videos from './pages/media/videos/Videos';
import Audios from './pages/media/audios/Audios';
import Others from './pages/media/others/Others';
import Passwords from './pages/media/passwords/Passwords';
import Storage from './pages/Storage/Storage';

function App() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchAuthStatus = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (token) {
          const response = await checkTokenIsValid(token);
          if (response.success) {
            const user = await loadUser(response.user.userId);
            if (user) {
              dispatch(setUser(user));
              dispatch(setAuthState(true, token));
            } else {
              dispatch(setAuthState(false, ""));
            }
          } else {
            dispatch(setAuthState(false, ""));
          }
        } else {
          dispatch(setAuthState(false, ""));
        }
      } catch (error) {
        console.error("Error loading auth state:", error);
        dispatch(setAuthState(false, ""));
      } finally {
        setLoading(false);
      }
    };

    fetchAuthStatus();
  }, [dispatch]);

  if (loading) {
    return <div className="loading-container">
      <Lottie className='loading-animation' animationData={LoadingAnimation} loop={true} autoplay={true} />
    </div>;
  }

  return (
    <Router>
      <div className="App">
        {isAuthenticated ? (
          <div className='main-container'>
            <Header />
            <div className='main-row'>
              <SideBar />
              <div className='main-content'>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/folders" element={<Folders />} />
                  <Route path="/favourites" element={<Favourites />} />
                  <Route path="/folders/:folderId" element={<Folder />} />
                  <Route path="/trash" element={<Trash />} />
                  <Route path="/images" element={<Images />} />
                  <Route path="/videos" element={<Videos />} />
                  <Route path="/audios" element={<Audios />} />
                  <Route path="/others" element={<Others />} />
                  <Route path="/passwords" element={<Passwords />} />
                  <Route path="/storage" element={<Storage />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </div>
            </div>
          </div>
        ) : (
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="*" element={<Navigate to="/auth" />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;