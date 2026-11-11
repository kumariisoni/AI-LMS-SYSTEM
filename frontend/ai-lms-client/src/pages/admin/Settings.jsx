import { useState } from "react";
import { Settings as SettingsIcon, Save, Database, Shield, Globe } from "lucide-react";
import { Button, Input, Card, Alert } from "../../components/common/UIPrimitives";

export default function Settings() {
  const [platformName, setPlatformName] = useState("Learnova AI");
  const [mongoUri, setMongoUri] = useState("mongodb://localhost:27017");
  const [dbName, setDbName] = useState("AI_LMS");
  const [jwtExpiry, setJwtExpiry] = useState("60");
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 font-sans max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
            <SettingsIcon className="w-3.5 h-3.5 text-indigo-600" />
            <span>Platform Configuration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            System & Database Settings
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Manage global Learnova AI variables, MongoDB cluster credentials, and authentication security.
          </p>
        </div>
      </div>

      {saved && (
        <Alert type="success">
          Settings updated successfully! Changes applied to application environment.
        </Alert>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Branding */}
        <Card className="p-6 bg-white space-y-4">
          <div className="flex items-center gap-2.5 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            <Globe className="w-4 h-4 text-indigo-600" />
            <span>General Platform Branding</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Platform Name"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
            />
            <Input
              label="Support Email"
              type="email"
              defaultValue="support@learnova.ai"
            />
          </div>
        </Card>

        {/* Database Configuration */}
        <Card className="p-6 bg-white space-y-4">
          <div className="flex items-center gap-2.5 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            <Database className="w-4 h-4 text-indigo-600" />
            <span>MongoDB Connection Settings</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Connection String (URI)"
              value={mongoUri}
              onChange={(e) => setMongoUri(e.target.value)}
            />
            <Input
              label="Database Name"
              value={dbName}
              onChange={(e) => setDbName(e.target.value)}
            />
          </div>
        </Card>

        {/* Authentication & Security */}
        <Card className="p-6 bg-white space-y-4">
          <div className="flex items-center gap-2.5 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            <Shield className="w-4 h-4 text-indigo-600" />
            <span>Authentication & Security Controls</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="JWT Token Expiry (Minutes)"
              type="number"
              value={jwtExpiry}
              onChange={(e) => setJwtExpiry(e.target.value)}
            />
            <Input
              label="Password Minimum Length"
              type="number"
              defaultValue="6"
              disabled
              helperText="Enforced by backend security validation"
            />
          </div>
        </Card>

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" size="md" icon={Save}>
            Save Configuration
          </Button>
        </div>
      </form>
    </div>
  );
}
