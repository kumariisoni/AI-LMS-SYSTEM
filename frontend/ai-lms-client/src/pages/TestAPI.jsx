import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { Database, CheckCircle2, AlertCircle, RefreshCw, ArrowLeft, Server, Cpu } from "lucide-react";

function TestAPI() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const testMongoConnection = async () => {
    setLoading(true);
    setResponse(null);
    setError(null);
    try {
      const res = await api.get("/Test/mongodb");
      setResponse(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to connect to backend API"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">

        {/* Navigation back */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
            <Server className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Backend & Database Test</h1>
            <p className="text-slate-400 text-sm">Verify connection between React Client, .NET Web API & MongoDB</p>
          </div>
        </div>

        {/* Server Specs Card */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl flex items-center gap-3">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <div>
              <div className="text-xs text-slate-400">Backend API Endpoint</div>
              <div className="text-sm font-mono font-medium text-slate-200">http://localhost:5291</div>
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl flex items-center gap-3">
            <Database className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-xs text-slate-400">Database Engine</div>
              <div className="text-sm font-mono font-medium text-slate-200">MongoDB (Local)</div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={testMongoConnection}
          disabled={loading}
          className="w-full py-3.5 px-6 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" /> Testing Connection...
            </>
          ) : (
            <>
              <Database className="w-5 h-5" /> Run MongoDB Test
            </>
          )}
        </button>

        {/* Output Section */}
        {response && (
          <div className="mt-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-2">
              <CheckCircle2 className="w-5 h-5" /> Connection Successful!
            </div>
            <pre className="text-xs font-mono bg-slate-950/80 p-3 rounded-lg overflow-x-auto text-emerald-200 border border-emerald-900/50">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300">
            <div className="flex items-center gap-2 text-rose-400 font-semibold mb-2">
              <AlertCircle className="w-5 h-5" /> Connection Failed
            </div>
            <p className="text-sm font-mono bg-slate-950/80 p-3 rounded-lg text-rose-200 border border-rose-900/50">
              {error}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

export default TestAPI;
