import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  HelpCircle
} from "lucide-react";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import { Button, Input, Card } from "../../components/common/UIPrimitives";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
  };

  const CONTACT_INFO = [
    {
      icon: MapPin,
      title: "Campus Location",
      detail: "Academic Complex, India",
      sub: "Available for scheduled visits",
    },
    {
      icon: Mail,
      title: "Email Support",
      detail: "support@learnova.ai",
      sub: "Average response within 12 hours",
    },
    {
      icon: Phone,
      title: "Academic Office",
      detail: "+91 98765 43210",
      sub: "Mon - Sat: 9 AM - 6 PM IST",
    },
    {
      icon: Clock,
      title: "Support Hours",
      detail: "Monday – Saturday",
      sub: "9:00 AM – 6:00 PM IST",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 pb-16">
        {/* Header */}
        <section className="pt-28 pb-14 bg-linear-to-b from-white via-indigo-50/20 to-slate-50 border-b border-slate-200/80">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
              <Mail className="w-3.5 h-3.5" />
              <span>Contact AI-LMS Support</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              Get in Touch with Our Team
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Have questions regarding courses, faculty collaboration, or technical support? We're here to help.
            </p>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CONTACT_INFO.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="p-5 bg-white">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {item.title}
                  </p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5 truncate">
                    {item.detail}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {item.sub}
                  </p>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Main Form & FAQ Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form */}
            <div className="lg:col-span-7">
              <Card className="p-6 sm:p-8 bg-white">
                <h2 className="text-xl font-bold text-slate-900">Send Us a Message</h2>
                <p className="text-xs text-slate-500 mt-1 mb-6">
                  Fill out the form below and an advisor will get back to you shortly.
                </p>

                {submitted ? (
                  <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <h3 className="text-base font-bold text-emerald-900">Message Received!</h3>
                    <p className="text-xs text-emerald-700 max-w-sm mx-auto">
                      Thank you, {formData.name}. We will respond to {formData.email} within 12 hours.
                    </p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({ name: "", email: "", subject: "", message: "" });
                      }}
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Full Name *"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                      <Input
                        label="Email Address *"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>

                    <Input
                      label="Subject"
                      placeholder="e.g. Course enrollment, Faculty query..."
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700">
                        Message *
                      </label>
                      <textarea
                        rows={4}
                        placeholder="How can we assist your learning journey?"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                        className="w-full p-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-400 resize-none"
                      />
                    </div>

                    <Button type="submit" variant="primary" size="md" className="w-full sm:w-auto" icon={Send}>
                      Submit Inquiry
                    </Button>
                  </form>
                )}
              </Card>
            </div>

            {/* Quick Support & FAQ */}
            <div className="lg:col-span-5 space-y-4">
              <Card className="p-6 bg-white space-y-4">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-900">Frequently Asked Questions</h3>
                </div>

                <div className="space-y-3 pt-2 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-800">How do role accounts work?</h4>
                    <p className="text-slate-500 mt-0.5">
                      Students can self-register. Faculty and Admin accounts are securely provisioned and authenticated via unified backend verification.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <h4 className="font-bold text-slate-800">Are courses accredited?</h4>
                    <p className="text-slate-500 mt-0.5">
                      Yes, upon completing all modules and quizzes, students receive cryptographic verified digital certificates.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <h4 className="font-bold text-slate-800">Is the AI Assistant free?</h4>
                    <p className="text-slate-500 mt-0.5">
                      The AI assistant is fully integrated for enrolled students to ask conceptual queries and receive instant clarifications.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
