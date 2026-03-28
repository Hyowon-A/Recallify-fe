import { useTranslation } from "react-i18next";

type Props = { onGetStarted: () => void };

export default function Landing({ onGetStarted }: Props) {
  const { i18n, t } = useTranslation();
  const isEnglish = i18n.language.startsWith("en");
  const steps = [
    [t("landing.howTitle1"), t("landing.howSub1")],
    [t("landing.howTitle2"), t("landing.howSub2")],
    [t("landing.howTitle3"), t("landing.howSub3")],
    [t("landing.howTitle4"), t("landing.howSub4")],
  ];

  return (
    <div className="space-y-12 pb-8">
      <section className="hero-grid glass-panel mx-auto overflow-hidden rounded-[40px] px-6 py-10 sm:px-8 md:px-10 md:py-12">
        <div className="grid max-w-6xl grid-cols-1 items-center gap-10 md:grid-cols-[1.1fr_0.9fr]">
          <div className="text-center md:text-left">
            <div className="inline-flex rounded-full border border-emerald-200 bg-white/70 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">
              AI study workflow
            </div>
            <h1 className="mt-6 text-5xl font-extrabold leading-[1.02] tracking-tight text-slate-950 md:text-6xl">
              {isEnglish ? (
                <>
                  {t("landing.heroTitle")}{" "}
                  <span className="brand-font text-emerald-600">Recallify</span>
                </>
              ) : (
                <>
                  <span className="brand-font text-emerald-600">Recallify</span>
                  {t("landing.heroTitle.part1")} <br />
                  <span className="mt-2 inline-block">{t("landing.heroTitle.part2")}</span>
                </>
              )}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              {t("landing.heroSub.part1")}{" "}
              <span className="font-semibold text-emerald-700">
                {t("landing.heroSub.highlight")}
              </span>
              {t("landing.heroSub.part2")}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <button
                onClick={onGetStarted}
                className="rounded-full bg-slate-900 px-6 py-3.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                {t("landing.getStarted")}
              </button>
              <a
                href="#how"
                className="field-shell rounded-full px-6 py-3.5 font-semibold text-slate-700 transition hover:bg-white"
              >
                {t("landing.how")}
              </a>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 md:justify-start">
              {["Upload once", "Generate in seconds", "Review with structure"].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/70 bg-white/65 px-4 py-2 text-sm font-medium text-slate-600"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-lime-200/70 blur-2xl" />
            <div className="absolute -left-6 bottom-8 h-24 w-24 rounded-full bg-emerald-200/70 blur-2xl" />
            <div className="surface-card relative overflow-hidden rounded-[32px] p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700/80">
                    Preview
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-900">Adaptive quiz session</p>
                </div>
                <div className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                  92% ready
                </div>
              </div>
              <div className="space-y-4 rounded-[28px] bg-[linear-gradient(180deg,_#f9fdf9,_#eef8f0)] p-5">
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>Biology: Cell structure</span>
                  <span>04 / 10</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white">
                  <div className="h-full w-[40%] rounded-full bg-gradient-to-r from-emerald-500 to-lime-400" />
                </div>
                <div className="rounded-[24px] bg-white p-5 soft-ring">
                  <p className="text-lg font-semibold text-slate-900">
                    What is the primary function of mitochondria in a cell?
                  </p>
                  <div className="mt-4 space-y-3 text-sm">
                    {[
                      { label: "Store genetic material", selected: false },
                      { label: "Produce usable energy", selected: true },
                      { label: "Control water balance", selected: false },
                      { label: "Break down proteins", selected: false },
                    ].map(({ label, selected }) => (
                      <div
                        key={label}
                        className={`rounded-2xl border px-4 py-3 ${
                          selected
                            ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                            : "border-slate-200 bg-white text-slate-600"
                        }`}
                      >
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  {[
                    ["New", "12"],
                    ["Learning", "8"],
                    ["Due", "3"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl bg-white p-4 text-center soft-ring">
                      <p className="text-slate-500">{label}</p>
                      <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-5 px-1 md:grid-cols-3">
        {[
          {
            title: "From notes to active recall",
            body: "Turn lecture PDFs and reading notes into practice material without hand-writing every card.",
          },
          {
            title: "Made for fast review loops",
            body: "Keep one clean workspace for creation, public sharing, and repeat study sessions.",
          },
          {
            title: "Calm, structured interface",
            body: "Sharper hierarchy, clearer actions, and less visual noise across the core flow.",
          },
        ].map((feature) => (
          <div key={feature.title} className="surface-card rounded-[28px] p-6">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-700/75">
              Why it works
            </p>
            <h3 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
              {feature.title}
            </h3>
            <p className="mt-3 leading-7 text-slate-600">{feature.body}</p>
          </div>
        ))}
      </section>

      <section id="how" className="mx-auto max-w-6xl px-1 py-2">
        <div className="mb-6">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-emerald-700/80">
            Workflow
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            A cleaner four-step study cycle
          </h2>
        </div>
        <ol className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {steps.map(([title, body], i) => (
            <li key={i} className="surface-card rounded-[30px] p-6">
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 font-bold text-white">
                {i + 1}
              </div>
              <h4 className="text-xl font-bold tracking-tight text-slate-900">{title}</h4>
              <p className="mt-3 leading-7 text-slate-600">{body}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
