export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Haven
        </h1>
        <p className="text-gray-600 mb-8">Landing page - to be designed</p>
        <a
          href="/editor"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Go to Editor
        </a>
      </div>
    </div>
  );
}
