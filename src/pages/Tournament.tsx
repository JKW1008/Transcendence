import { Link } from 'react-router-dom';

export function Tournament() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
          Tournament
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Coming soon...
        </p>
        <Link
          to="/"
          className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
