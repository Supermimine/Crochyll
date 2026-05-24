import { ref, onMounted, onUnmounted } from "vue";

const language = () => {
  let lang = localStorage.getItem("language");

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

  localStorage.setItem("language", lang);
  return lang;
}

const getTheme = (): "light" | "dark" => {
  let stored = localStorage.getItem("theme") as "light" | "dark" | null;

  if (stored === "light" || stored === "dark") {
    return stored;
  }

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = prefersDark ? "dark" : "light";

  localStorage.setItem("theme", theme);
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

export { useScreen, language, getTheme, sleep };