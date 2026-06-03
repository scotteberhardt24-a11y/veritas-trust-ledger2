export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="veritas-glass rounded-[32px] p-12 max-w-5xl w-full text-center">

        <div className="mb-8 flex justify-center">
          <img
            src="/veritas-shield.png"
            alt="VERITAS"
            className="w-40 h-40 object-contain veritas-gold-glow"
          />
        </div>

        <h1 className="veritas-title veritas-cursive">
          VERITAS
        </h1>

        <p className="mt-6 text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Enterprise-grade trust infrastructure powered by security,
          verification, escrow intelligence, and AI-assisted dispute resolution.
        </p>

        <div className="mt-12 flex flex-wrap gap-6 justify-center">
          <button className="px-8 py-4 rounded-2xl bg-blue-700 hover:bg-blue-600 transition-all veritas-blue-glow font-semibold">
            Enter Platform
          </button>

          <button className="px-8 py-4 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20 transition-all veritas-gold-glow font-semibold">
            Trust Network
          </button>
        </div>
      </div>
    </div>
  );
}