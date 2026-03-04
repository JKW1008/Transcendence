import { Routes, Route } from 'react-router-dom';
import { Home, GamePage, Tournament, OnlineGame, Login, Register, Profile, Settings, Leaderboard, Friends, PrivacyPolicy, TermsOfService, NotFound } from './pages';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/online" element={<OnlineGame />} />
        <Route path="/tournament" element={<Tournament />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
