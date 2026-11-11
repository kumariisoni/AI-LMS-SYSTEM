import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Award, Download, ShieldCheck, Eye, BookOpen, Loader2 } from "lucide-react";
import { Card, Badge, Button, Modal } from "../../components/common/UIPrimitives";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

export default function Certificates() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCert, setSelectedCert] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchCertificates = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/certificates/my");
        if (isMounted) {
          setCertificates(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err) {
        if (isMounted) {
          setError("Failed to load your certificates. Please check your connection.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCertificates();
    return () => {
      isMounted = false;
    };
  }, []);

  const formatIssueDate = (dateStr) => {
    if (!dateStr) return "Recently Issued";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  const handleDownload = (cert) => {
    // Printable / savable credential summary
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${cert.certificateNumber} - Learnova AI Certificate</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; text-align: center; color: #0f172a; }
            .cert-box { border: 8px double #4338ca; padding: 50px; max-width: 800px; margin: 0 auto; border-radius: 16px; background: #fafafa; }
            h1 { font-size: 32px; color: #312e81; margin-bottom: 8px; }
            .sub { font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #64748b; margin-bottom: 24px; }
            .name { font-size: 28px; font-weight: bold; color: #4338ca; text-decoration: underline; margin: 20px 0; }
            .desc { font-size: 16px; line-height: 1.6; color: #334155; max-width: 600px; margin: 0 auto 30px; }
            .footer { display: flex; justify-content: space-between; border-top: 2px solid #e2e8f0; padding-top: 20px; font-size: 13px; color: #64748b; }
            .number { font-family: monospace; font-weight: bold; color: #4338ca; }
          </style>
        </head>
        <body>
          <div class="cert-box">
            <h1>Learnova AI Academy</h1>
            <div class="sub">Official Verified Certificate of Completion</div>
            <p>This is to certify that</p>
            <div class="name">${cert.studentName || user?.name || "Student"}</div>
            <p class="desc">has successfully completed all requirements, modules, and assessments in <strong>${cert.courseTitle}</strong> with ${cert.grade || "Distinction (100%)"}.</p>
            <div class="footer">
              <div>
                <strong>${cert.instructorName || "Academic Faculty"}</strong><br/>
                Lead Instructor
              </div>
              <div>
                <strong>${formatIssueDate(cert.issuedAt)}</strong><br/>
                <span class="number">${cert.certificateNumber}</span>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      alert(`Certificate ${cert.certificateNumber} details ready for printing.`);
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-5xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="border-b border-slate-200/80 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          My Certificates
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Official credentials verified and issued upon course completion and capstone review.
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-sm font-medium text-slate-600">Loading your verified credentials...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center space-y-3">
          <p className="text-sm font-semibold text-red-800">{error}</p>
          <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && certificates.length === 0 && (
        <div className="text-center py-16 px-6 bg-white border border-slate-200/80 rounded-2xl shadow-2xs space-y-4">
          <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto text-indigo-600">
            <Award className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              No Certificates Earned Yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Certificates are awarded upon 100% completion of course lessons and video milestones. Enroll in a course, finish all modules, and claim your credential.
            </p>
          </div>
          <div className="pt-2">
            <Link to="/courses">
              <Button variant="primary" size="sm" icon={BookOpen}>
                Browse Courses
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Certificates Grid */}
      {!loading && !error && certificates.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {certificates.map((cert) => (
            <Card
              key={cert.id || cert.certificateNumber}
              className="p-5 sm:p-6 space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    {cert.certificateNumber}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    {cert.courseTitle}
                  </span>
                  <h2 className="text-base font-bold text-slate-900 leading-snug mt-0.5">
                    {cert.title || "Certificate of Conceptual & Practical Mastery"}
                  </h2>
                </div>

                <div className="text-xs text-slate-600 space-y-1 pt-1">
                  <p>Issued to: <span className="font-semibold text-slate-900">{cert.studentName || user?.name || "Student"}</span></p>
                  <p>Completed: <span className="font-semibold text-slate-900">{formatIssueDate(cert.issuedAt)}</span></p>
                  <p>Performance: <span className="font-semibold text-indigo-600">{cert.grade || "Distinction (100%)"}</span></p>
                  <p className="text-[11px] text-slate-400">Instructor: {cert.instructorName || "Academic Faculty"}</p>
                </div>

                {cert.skills && cert.skills.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap pt-1">
                    {cert.skills.map((s, idx) => (
                      <Badge key={idx} variant="slate" size="sm">{s}</Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setSelectedCert(cert)}
                  icon={Eye}
                >
                  View
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleDownload(cert)}
                  icon={Download}
                >
                  Download
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Certificate Modal Preview */}
      {selectedCert && (
        <Modal
          isOpen={!!selectedCert}
          onClose={() => setSelectedCert(null)}
          title="Official Verified Credential"
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6">
            <div className="p-8 sm:p-10 rounded-xl bg-slate-50 border-2 border-slate-200 text-center space-y-4 shadow-2xs relative">
              <div className="flex items-center justify-center gap-2">
                <img
                  src="/learnova-icon.png"
                  alt="Learnova AI"
                  className="w-10 h-10 object-contain mx-auto"
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              </div>

              <span className="text-[11px] uppercase font-bold tracking-widest text-slate-400 block">
                Certificate of Academic Achievement
              </span>

              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {selectedCert.issuer || "Learnova AI Academy"}
              </h2>

              <p className="text-xs text-slate-500">This document verifies that</p>

              <p className="text-xl sm:text-2xl font-bold text-indigo-600 underline decoration-indigo-200 underline-offset-4">
                {selectedCert.studentName || user?.name || "Student Learner"}
              </p>

              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                has successfully mastered all rigorous concepts and practical coursework in{" "}
                <strong>{selectedCert.courseTitle}</strong> with {selectedCert.grade || "Distinction (100%)"}.
              </p>

              <div className="pt-6 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                <div className="text-left">
                  <p className="font-bold text-slate-800">{selectedCert.instructorName || "Academic Faculty"}</p>
                  <p className="text-[10px]">Lead Curriculum Director</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800">{formatIssueDate(selectedCert.issuedAt)}</p>
                  <p className="text-[10px] font-mono text-indigo-700 font-bold">{selectedCert.certificateNumber}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5">
              <Button variant="secondary" size="sm" onClick={() => setSelectedCert(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={Download}
                onClick={() => handleDownload(selectedCert)}
              >
                Print / Save PDF
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
