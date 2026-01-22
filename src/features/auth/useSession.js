import { useEffect, useState } from "react";
import { supabase } from "../../../supabase";

export default function useSession() {
  const [session, setSession] = useState(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) console.error("[auth.getSession]", error);
      setSession(data.session ?? null);
      setIsSessionLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;
      setSession(newSession ?? null);
      setIsSessionLoading(false); // important
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, accessToken: session?.access_token ?? null, isSessionLoading };
}