// index.tsx หรือ main.tsx
import './style.css'
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './compronents/Pubblic_components/AuthContextType';
import Home from './page/Home/Home';
// import Writer from './page/writer/Writer';
// import Writer_edit from './page/writer/Writer_edit';
import Profile from './page/Profile/profile';
import EditProfile from './page/Profile/editProfile';
import Login from './page/authentication/Login/Login';
import AdminLogin from './page/authentication/Login/AdminLogin';
import Register from './page/authentication/Register/register';
import Income from './page/writer/Income';
import Overview from './page/Overview/Overview';
import Tips from './page/Tips/Tips';
import Calendar from './page/calendar/calendar';
import MoodTracker from './page/Mood/MoodTracker';

const router = createBrowserRouter([
  { path: "/home", element: <Home /> },
  { path: "/profile", element: <Profile /> },
  // { path: "/Writer", element: <Writer /> },
  // { path: "/Writer_edit", element: <Writer_edit /> },
  { path: "/editProfile", element: <EditProfile /> },
  { path: "/Income", element: <Income /> },
  { path: "/", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/overview", element: <Overview />},
  { path: "/tips", element: <Tips />},
  { path: "/calendar", element: <Calendar />},
  { path: "/moodtracker", element: <MoodTracker />},
  { path: "/admin/login", element: <AdminLogin /> },
]);


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
                 <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
