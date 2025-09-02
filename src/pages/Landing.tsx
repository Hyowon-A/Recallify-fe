import Layout from "./_Layout";
type Props = { onGetStarted: () => void };

export default function Landing({ onGetStarted }: Props) {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-20 md:grid-cols-2">
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-extrabold md:text-5xl">
            Master Your Memory with <span className="brand-font text-emerald-600">Recallify</span>
          </h1>
          <p className="mt-4 text-lg text-gray-700">
            Turn your notes into study‑ready <span className="font-semibold text-emerald-700">MCQs and flashcards</span>, and
            remember them with spaced repetition.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3 md:justify-start">
            <button
              onClick={onGetStarted}
              className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
            >
              Get Started
            </button>
            <a href="#how" className="rounded-xl border border-gray-300 px-6 py-3 hover:bg-gray-50">
              How it works
            </a>
          </div>
        </div>

        {/* Illustration placeholder (can change)*/}
        <div className="hidden md:block">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="mb-4 h-3 w-32 rounded-full bg-emerald-100" />
            <div className="rounded-2xl border bg-white p-5">
              <p className="mb-3 font-semibold">What is the capital of France?</p>
              <ul className="space-y-2 text-sm">
                {["Berlin", "Paris", "Madrid", "Rome"].map((t, i) => (
                  <li
                    key={i}
                    className={`rounded-xl border px-4 py-2 ${
                      t === "Paris"
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white/70 border-t">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-14 md:grid-cols-4">
          {[
            { title: "AI MCQ Generator", body: "Paste notes → get multiple‑choice questions instantly." },
            { title: "Smart Review", body: "Spaced repetition to beat forgetting." },
            { title: "Deck & Quiz Manager", body: "Organize subjects and sets fast." },
            { title: "Progress Tracking", body: "See accuracy and mastery grow." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border bg-white p-6 shadow-sm">
              <h3 className="mb-2 font-semibold">{f.title}</h3>
              <p className="text-gray-600">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-4 py-16">
        <ol className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {[
            ["Create a set", "Add topics or paste notes."],
            ["Generate MCQs", "AI creates questions & choices."],
            ["Practice & Review", "Instant feedback + hints."],
            ["Track mastery", "Scores and accuracy trends."],
          ].map(([t, b], i) => (
            <li key={i} className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 font-bold text-white">
                {i + 1}
              </div>
              <h4 className="font-semibold">{t}</h4>
              <p className="text-gray-600">{b}</p>
            </li>
          ))}
        </ol>
      </section>

      <footer className="border-t bg-white/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-8 text-sm text-gray-500">
          <span>© {new Date().getFullYear()} Recallify</span>
          <span>Study smarter.</span>
        </div>
      </footer>
    </>
  );
}