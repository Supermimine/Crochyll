import { ref, onMounted, onUnmounted } from "vue";

const safeStorageGet = (key: string): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeStorageSet = (key: string, value: string): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(key, value);
  } catch {
    return;
  }
};

const safeStorageGetJSON = <T>(key: string, fallback: T): T => {
  const value = safeStorageGet(key);

  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const safeStorageSetJSON = (key: string, value: unknown): void => {
  safeStorageSet(key, JSON.stringify(value));
};

const language = () => {
  let lang = safeStorageGet("language");

  if (lang != null) {
    return lang;
  }

  switch (navigator.language || (navigator as any).userLanguage) {
    case "fr":
    case "fr-FR":
      lang = "fr";
      break;
    case "en":
    case "en-US":
      lang = "en";
      break;
    case "es":
    case "es-ES":
      lang = "es";
      break;
    case "it":
    case "it-IT":
      lang = "it";
      break;
    case "de":
    case "de-DE":
      lang = "de";
      break;
    default:
      lang = "fr";
  }

  safeStorageSet("language", lang);
  return lang;
}

const getTheme = (): "light" | "dark" => {
  let stored = safeStorageGet("theme") as "light" | "dark" | null;

  if (stored === "light" || stored === "dark") {
    return stored;
  }

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = prefersDark ? "dark" : "light";

  safeStorageSet("theme", theme);
  return theme;
};

const useScreen = () => {
  const isMobile = ref(window.innerWidth <= 650);

  const update = () => {
    isMobile.value = window.innerWidth <= 650;
  };

  onMounted(() => {
    window.addEventListener("resize", update);
  });

  onUnmounted(() => {
    window.removeEventListener("resize", update);
  });

  return { isMobile };
}

const sleep = async (ms: number): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, ms));
};

export { useScreen, language, getTheme, sleep, safeStorageGet, safeStorageSet, safeStorageGetJSON, safeStorageSetJSON };