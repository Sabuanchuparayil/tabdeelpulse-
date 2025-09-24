
import React, { useContext } from 'react';
import { AuthContext } from './contexts/AuthContext';
import { ThemeContext } from './contexts/ThemeContext';
import LoginPage from './components/auth/LoginPage';
import MainLayout from './components/layout/MainLayout';

const App: React.FC = () => {
    const authContext = useContext(AuthContext);
    const themeContext = useContext(ThemeContext);

    if (!authContext || !themeContext) {
        return <div>Loading...</div>; // Or some other loading state
    }

    const { user } = authContext;

    return (
        <div className="font-sans">
            {user ? <MainLayout /> : <LoginPage />}
        </div>
    );
};

export default App;
