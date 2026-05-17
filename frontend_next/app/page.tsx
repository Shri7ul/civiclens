export default function Home() {
  return (
    <div className="max-w-4xl mx-auto py-20 text-center">
      <h1 className="text-4xl font-bold mb-4">CivicLens</h1>
      <p className="text-slate-300">Modern civic reporting and case management platform.</p>
      <div className="mt-10 flex justify-center gap-4">
        <a href="/login" className="px-6 py-3 bg-indigo-600 rounded-md text-white">Login</a>
        <a href="/register" className="px-6 py-3 bg-slate-700 rounded-md text-white">Register</a>
      </div>
    </div>
  )
}
