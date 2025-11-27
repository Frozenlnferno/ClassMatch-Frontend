const isDev = import.meta.env.DEV;
const logger = {
    log: (...args) => {
        if (isDev) { console.log("[LOG]:", ...args); }
    },
    info: (...args) => {
        if (isDev) { console.info("[INFO]:", ...args); }
    },
    warn: (...args) => {
        if (isDev) { console.warn("[WARN]:", ...args); }
    },
    error: (...args) => {
        console.error("[ERROR]", ...args);
    },
}

export default logger;