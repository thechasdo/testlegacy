import { createFileRoute, Outlet, redirect, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/login" });
    }
  },
  component: AuthedShell,
});

function AuthedShell() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-pop-cream">
      <nav className="border-b-2 border-pop-ink bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="font-display text-2xl text-pop-blue">
            chasdo
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-sm font-bold text-pop-ink/70">
              {user?.email}
            </span>
            <button
              onClick={async () => {
                await signOut();
                navigate({ to: "/login" });
              }}
              className="px-4 py-2 rounded-full border-2 border-pop-ink font-bold uppercase text-xs hover:bg-pop-yellow"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>
      <Outlet />
    </div>
  );
}
