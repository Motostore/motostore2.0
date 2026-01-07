"use client";

import { useState } from "react";
import { EyeIcon, EyeSlashIcon, ClipboardDocumentIcon, CheckBadgeIcon } from "@heroicons/react/24/outline";

export default function SecretVault({ text, isCopy = false }: { text: string; isCopy?: boolean }) {
  const [reveal, setReveal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="group flex items-center justify-between gap-3 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 hover:bg-white hover:border-red-100 transition-all cursor-pointer"
      onMouseEnter={() => setReveal(true)}
      onMouseLeave={() => setReveal(false)}
    >
      <div className={`font-mono text-sm font-medium transition-all ${reveal ? "text-slate-900" : "text-slate-400 blur-[4px]"}`}>
        {reveal ? text : "••••••••••"}
      </div>
      <div className="flex gap-2">
        {isCopy && (
          <button onClick={(e) => { e.stopPropagation(); handleCopy(); }} className="text-slate-400 hover:text-red-600 transition-colors">
            {copied ? <CheckBadgeIcon className="w-4 h-4 text-green-500" /> : <ClipboardDocumentIcon className="w-4 h-4" />}
          </button>
        )}
        <div className="text-slate-400">
            {reveal ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
        </div>
      </div>
    </div>
  );
}