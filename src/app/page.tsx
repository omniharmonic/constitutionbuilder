import { Logo } from "@/components/shared/logo";
import { Footer } from "@/components/shared/footer";

const STEPS = [
  {
    number: "01",
    title: "Survey",
    subtitle: "Lay the Foundation",
    description:
      "Participants have guided conversations with an AI constitutional architect. Through stories and scenarios, latent knowledge about governance, values, and structure naturally emerges.",
  },
  {
    number: "02",
    title: "Draft",
    subtitle: "Raise the Frame",
    description:
      "The system synthesizes all participant insights into a structured constitution draft — grounded in what people actually said, with tensions surfaced explicitly.",
  },
  {
    number: "03",
    title: "Feedback",
    subtitle: "Review the Plans",
    description:
      "Participants review the draft alongside a facilitator agent, providing targeted feedback. Agreements confirm, disagreements sharpen, suggestions refine.",
  },
  {
    number: "04",
    title: "Finalize",
    subtitle: "Set the Keystone",
    description:
      "Feedback is synthesized into a revised draft. The cycle repeats until the group converges. The final constitution is locked and distributed.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-24 text-center bg-gradient-to-b from-stone-50 to-parchment">
        <Logo size="lg" className="mb-8" />
        <h1 className="text-5xl md:text-6xl font-display font-bold text-stone-950 tracking-tight max-w-3xl">
          Constitution Builder
        </h1>
        <p className="mt-6 text-xl md:text-2xl text-stone-600 font-body leading-relaxed max-w-2xl">
          AI-guided collaborative constitution creation.
          Surface collective intelligence, build governance together.
        </p>
        <div className="flex gap-4 mt-10">
          <a
            href="/register"
            className="px-8 py-4 bg-brass text-white rounded-lg font-semibold text-lg hover:bg-brass-light transition-colors shadow-sm"
          >
            Lay the Foundation
          </a>
          <a
            href="/login"
            className="px-8 py-4 bg-white text-stone-800 rounded-lg font-medium text-lg border border-stone-200 hover:border-stone-400 transition-colors"
          >
            Sign In
          </a>
        </div>
      </section>

      {/* What is this */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-display font-bold text-stone-950">
            What is this?
          </h2>
          <p className="mt-6 text-lg text-stone-600 leading-relaxed">
            Most groups that need constitutions don&apos;t know how to write them.
            And most people within those groups carry latent knowledge about governance,
            values, and structure that never makes it into traditional surveys or workshops.
          </p>
          <p className="mt-4 text-lg text-stone-600 leading-relaxed">
            Constitution Builder replaces the multi-week, facilitator-dependent,
            document-heavy process with an AI-guided conversational experience.
            An agent that understands the full architecture of organizational governance
            draws out what people already know — through the kind of conversation where
            values, worldview, and structural instincts naturally emerge.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-stone-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-stone-950 text-center mb-16">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {STEPS.map((step) => (
              <div
                key={step.number}
                className="bg-white rounded-xl border border-stone-200 p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-baseline gap-3 mb-3">
                  <span className="text-3xl font-mono text-brass font-bold">
                    {step.number}
                  </span>
                  <div>
                    <h3 className="text-xl font-display font-semibold text-stone-950">
                      {step.title}
                    </h3>
                    <p className="text-sm text-stone-400 italic">{step.subtitle}</p>
                  </div>
                </div>
                <p className="text-stone-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built on */}
      <section className="py-16 px-4 bg-parchment">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-stone-600">
            Built on the{" "}
            <span className="font-semibold text-stone-800">
              OpenCivics Solidarity Network Constitution
            </span>{" "}
            template — a comprehensive framework for organizational governance
            covering Identity, Structure, and Protocols.
          </p>
          <p className="mt-4 text-sm text-stone-400">
            By OpenCivics Labs
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
