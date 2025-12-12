import { Link } from 'react-router-dom';

export function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6">
          PONG
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          The classic arcade game, reimagined
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
      </div>
    </div>
  );
}
