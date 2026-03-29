import { Link, NavLink } from "react-router-dom";
import { Camera, LogOut } from "lucide-react";

type Props = {
  loggedIn: boolean;
  showCustomerNav: boolean;
  showOwnerNav: boolean;
  onLogout: () => void;
};

export default function AppHeader({
  loggedIn,
  showCustomerNav,
  showOwnerNav,
  onLogout,
}: Props) {
  const pill =
    "rounded-full px-4 py-2 text-sm font-bold transition-colors max-md:px-3 max-md:text-xs";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/90 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex min-h-16 max-w-[1200px] items-center justify-between gap-3 px-4 py-2 md:px-6 lg:min-h-20 lg:py-0">
        <Link
          to="/"
          className="flex items-center gap-2 text-slate-900 no-underline"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Camera size={22} strokeWidth={2} aria-hidden />
          </div>
          <div className="hidden md:block">
            <span className="text-lg font-extrabold tracking-tight">
              EQUIPMENT
              <span className="text-brand-600">RENTAL</span>
            </span>
          </div>
        </Link>

        <nav
          className="flex flex-wrap items-center justify-end gap-2 md:gap-4"
          aria-label="Main"
        >
          <div className="flex max-w-[min(100vw-8rem,28rem)] items-center gap-1 overflow-x-auto rounded-full border border-slate-200 bg-slate-100/90 p-1 sm:max-w-none md:flex-1 md:justify-center no-scrollbar">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `${pill} ${isActive ? "bg-white text-brand-600 shadow-sm" : "text-slate-600 hover:text-slate-900"}`
              }
            >
              Home
            </NavLink>
            {loggedIn && showCustomerNav ? (
              <NavLink
                to="/my-bookings"
                className={({ isActive }) =>
                  `${pill} ${isActive ? "bg-white text-brand-600 shadow-sm" : "text-slate-600 hover:text-slate-900"}`
                }
              >
                My Bookings
              </NavLink>
            ) : null}
            {loggedIn && showOwnerNav ? (
              <NavLink
                to="/my-store"
                className={({ isActive }) =>
                  `${pill} ${isActive ? "bg-white text-brand-600 shadow-sm" : "text-slate-600 hover:text-slate-900"}`
                }
              >
                My store
              </NavLink>
            ) : null}
          </div>

          <span className="hidden text-xs font-medium text-slate-400 lg:inline">
            {loggedIn ? "Signed in" : "Guest"}
          </span>

          {loggedIn ? (
            <button
              type="button"
              onClick={onLogout}
              className="flex h-10 items-center gap-2 rounded-xl bg-slate-100 px-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200 md:px-4"
            >
              <LogOut size={16} aria-hidden />
              <span className="hidden md:inline">Logout</span>
            </button>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                to="/login"
                className="rounded-xl px-3 py-2 text-sm font-bold text-slate-600 no-underline transition-colors hover:text-brand-600 sm:px-4"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-brand-600 px-3 py-2 text-sm font-bold text-white no-underline shadow-sm shadow-brand-500/25 transition-colors hover:bg-brand-700 sm:px-5"
              >
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
