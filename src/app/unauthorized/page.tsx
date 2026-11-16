import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-2xl mb-6">
          <ShieldAlert className="w-10 h-10 text-red-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Unauthorized</h1>
        <p className="text-slate-400 mb-8">
          You don't have permission to access this page. Please sign in with an authorized account.
        </p>
        <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-medium transition-colors">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
