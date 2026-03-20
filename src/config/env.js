function readEnv(name) {
  const value = import.meta.env[name];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

export function requirePublicEnv(name) {
  return readEnv(name);
}

export function requirePublicUrlEnv(name) {
  const value = readEnv(name);

  try {
    const parsed = new URL(value);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("Unsupported protocol");
    }
  } catch {
    throw new Error(`Invalid URL environment variable: ${name}`);
  }

  return value.replace(/\/$/, "");
}
