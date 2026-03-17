/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getUserProfile } from "../features/settings/settingsService.js";
import useSession from "../utils/useSession.js";

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const { session, isSessionLoading } = useSession();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function refreshProfile() {
    if (!session) {
      setProfile(null);
      setError("");
      setIsLoading(false);
      return null;
    }

    try {
      setIsLoading(true);
      setError("");
      const nextProfile = await getUserProfile();
      setProfile(nextProfile);
      return nextProfile;
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : "Failed to load profile";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (isSessionLoading) return;
    refreshProfile();
  }, [session, isSessionLoading]);

  const value = useMemo(
    () => ({
      profile,
      setProfile,
      refreshProfile,
      isLoading: isSessionLoading || isLoading,
      error,
    }),
    [profile, isSessionLoading, isLoading, error],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }

  return context;
}
