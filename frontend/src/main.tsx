// index.tsx หรือ main.tsx
import './style.css'
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './compronents/Pubblic_components/AuthContextType';
import { BalanceProvider } from './compronents/Home_components/BalanceContext';
import Payment from './page/CoinsAndTransaction/CoinsAndTransaction';
import Home from './page/Home/Home';
import Writer from './page/writer/Writer';
import Writer_edit from './page/writer/Writer_edit';
import Profile from './page/Profile/profile';
import EditProfile from './page/Profile/editProfile';
import Login from './page/authentication/Login/Login';
import Register from './page/authentication/Register/register';
import L_Bookshelf from './page/Bookshelf/L_Bookshelf';
import Income from './page/writer/Income';
import SignInPages from '../แดนโค้ดมรณา/Logintest';
import Test from './page/test/tests';
import L_Content from './page/Bookshelf/L_Content';
import { HistoryProvider } from './compronents/Trasaction_compnents/HistoryContext';
import { LikeProvider } from './compronents/Book_components/LikeContext';
import { MusicProvider } from './compronents/song_components/musicprovider';

const router = createBrowserRouter([
  { path: "/Payment", element: <Payment /> },
  { path: "/", element: <Home /> },
  { path: "/profile", element: <Profile /> },
  { path: "/Writer", element: <Writer /> },
  { path: "/Writer_edit", element: <Writer_edit /> },
  { path: "/editProfile", element: <EditProfile /> },
  { path: "/Income", element: <Income /> },
  { path: "/a", element: <SignInPages /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/settings", element: <Test /> },
  { path: "/L_Content", element: <L_Content /> },
  { path: "/bookshelf", element: <L_Bookshelf /> },
  { path: "/L_content/:novelId", element: <L_Content />}
]);


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
        <HistoryProvider>
            <BalanceProvider>
            <LikeProvider>
                 <RouterProvider router={router} />
            </LikeProvider>
        </BalanceProvider>
      </HistoryProvider>
    </AuthProvider>
  </React.StrictMode>
);
