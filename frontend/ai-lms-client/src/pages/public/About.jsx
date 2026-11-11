import { Link } from "react-router-dom";
import {
  Sparkles,
  Award,
  CheckCircle2,
  ArrowRight,
  Target,
  Zap,
  ShieldCheck,
  HeartHandshake
} from "lucide-react";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import { Button, Card, Badge } from "../../components/common/UIPrimitives";

const VALUES = [
  {
    icon: Target,
    title: "Outcome-Driven",
    desc: "Every module and quiz is built around what engineering teams and tech leaders actually hire for — zero fluff, zero wasted time.",
  },
  {
    icon: Sparkles,
    title: "AI Personalization",
    desc: "Adaptive learning diagnostics identify weak spots and generate customized revision paths for every learner.",
  },
  {
    icon: Award,
    title: "Vetted Industry Faculty",
    desc: "Learn directly from senior engineers and designers who have shipped real products at scale.",
  },
  {
    icon: HeartHandshake,
    title: "Community & Mentorship",
    desc: "Learn alongside peers, get feedback on code reviews, and join weekly live workshops.",
  },
  {
    icon: Zap,
    title: "Project-Centric Mastery",
    desc: "Build production-grade applications that form an undeniable, job-winning portfolio.",
  },
  {
    icon: ShieldCheck,
    title: "Lifelong Growth",
    desc: "Lifetime access to updated course materials, AI tools, and career networking events.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 pb-16">
        {/* Hero Header */}
        <section className="pt-28 pb-16 bg-linear-to-b from-white via-indigo-50/20 to-slate-50 border-b border-slate-200/80">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>About Learnova AI</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Empowering Careers Through{" "}
              <span className="text-indigo-600">Intelligent Education</span>
            </h1>

            <p className="text-xs sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Learnova AI was founded with a singular conviction: learning high-impact technology skills shouldn't be passive or fragmented. We merge rigorous industry mentorship with personalized AI learning algorithms to give every learner an unfair advantage in their career.
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <Card className="p-6 sm:p-10 bg-white">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <Badge variant="indigo" size="sm">
                  Our Mission
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Bridging the Gap Between Traditional Academia & Modern Industry
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Traditional educational institutions move too slow, while generic online video libraries leave students without feedback or real-world capability.
                </p>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Learnova AI redefines this paradigm. Our curriculum is maintained in direct collaboration with practicing senior engineers and product leaders. With real-time adaptive quiz evaluations and intelligent course assistance, students learn faster and build demonstrable confidence.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {[
                    "100% Project Driven",
                    "Direct Faculty Access",
                    "AI Guided Review",
                    "Career Placement Aid",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200">
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80"
                    alt="Students collaborating"
                    className="w-full h-72 sm:h-80 object-cover"
                  />
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Values Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <Badge variant="indigo" size="sm" className="mb-2">
              Our Values
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              What We Stand For
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              The foundational principles guiding every course, instructor, and AI algorithm on Learnova AI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {VALUES.map((v) => {
              const Icon = v.icon;
              return (
                <Card key={v.title} hover className="p-6">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1.5">{v.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{v.desc}</p>
                </Card>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 mt-16 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Start Learning with AI-LMS
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            Join thousands of active students and faculty building the future of intelligent education.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link to="/courses">
              <Button variant="primary" size="md" icon={ArrowRight}>
                Explore Catalog
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="secondary" size="md">
                Create Account
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
