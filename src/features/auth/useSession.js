import { useState, useEffect } from "react";
import { supabase } from "../../../supabase";

export default function useSession() {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // get initial session
    supabase.auth.getSession()
        .then(({ data }) => {
            setIsLoading(false)
            setSession(data.session ?? null)
        });

    // subscribe to changes
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, accessToken: session?.access_token ?? null, isLoading };
}