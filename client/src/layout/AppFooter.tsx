import { Link } from "react-router-dom";
import { Camera } from "lucide-react";

export default function AppFooter() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white py-10">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-6 px-4 md:flex-row md:px-6">
        <Link
          to="/"
          className="flex items-center gap-2 text-slate-900 no-underline"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
            <Camera size={18} strokeWidth={2} aria-hidden />
          </div>
          <span className="text-sm font-extrabold tracking-tight">
            EQUIPMENT RENTAL
          </span>
        </Link>
        <p className="text-center text-xs font-medium text-slate-400 md:text-right">
          © {new Date().getFullYear()} Equipment Rental. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
