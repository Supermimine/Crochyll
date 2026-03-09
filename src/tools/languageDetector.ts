import { franc } from "franc-min";

export function detectLanguage(text: string): string | undefined {
  const lang = franc(text, { minLength: 150 });
  return lang === "und" ? undefined : lang;
}
