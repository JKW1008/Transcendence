import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Home() {
  const { user, logout, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col">
      {/* Header with Login/Logout */}
      <header className="p-4 flex justify-between items-center">
        <div className="text-white font-bold text-xl">PONG</div>
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="text-gray-400">Loading...</div>
          ) : user ? (
            <>
              <Link
                to="/profile"
                className="text-gray-300 hover:text-white transition-colors flex items-center gap-2"
              >
                <span className="font-semibold">{user.username}</span> {user.avatar}
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6">
            PONG
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            The classic arcade game, reimagined
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link
              to="/game"
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors text-lg"
            >
              Local Game
            </Link>
            <Link
              to="/online"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-lg"
            >
              Online Match
            </Link>
            <Link
              to="/tournament"
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors text-lg"
            >
              Tournament
            </Link>
          </div>

          <div className="flex justify-center">
            <Link
              to="/leaderboard"
              className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              🏆 Leaderboard
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-4 border-t border-gray-700">
        <div className="flex justify-center items-center gap-6 text-sm">
          <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <span className="text-gray-600">•</span>
          <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
            Terms of Service
          </Link>
        </div>
      </footer>
    </div>
  );
}
