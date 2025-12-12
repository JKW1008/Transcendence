import { Routes, Route } from 'react-router-dom';
import { Home, GamePage, Tournament, OnlineGame, NotFound } from './pages';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/game" element={<GamePage />} />
      <Route path="/online" element={<OnlineGame />} />
      <Route path="/tournament" element={<Tournament />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
