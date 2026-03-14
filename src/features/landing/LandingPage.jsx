import { Link } from "react-router-dom";
import { Upload, Users, Zap } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload Your Schedule",
    description: "Export your class schedule as a PDF and upload it, or enter your CRNs manually.",
  },
  {
    icon: Users,
    title: "Join or Create a Group",
    description: "Create a study group or join one with an invite code to connect with classmates.",
  },
  {
    icon: Zap,
    title: "Get Connected",
    description: "Instantly see which groupmates share your classes and coordinate together.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center sm:py-32">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Find your classmates,{" "}
            <span className="text-blue-600">effortlessly</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            ClassMatch helps university students upload their course schedules, join groups, and instantly discover who shares their classes.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              to="/signup"
              className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 border-t border-gray-200">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
            How It Works
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-gray-600">
            Three simple steps to start connecting with your classmates.
          </p>

          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-5">
                  <step.icon className="h-6 w-6" />
                </div>
                <span className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-600">
                  Step {i + 1}
                </span>
                <h3 className="text-lg font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <span className="text-sm text-gray-500">&copy; {new Date().getFullYear()} ClassMatch</span>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-700">About</a>
            <a href="#" className="hover:text-gray-700">Privacy</a>
            <a href="#" className="hover:text-gray-700">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
