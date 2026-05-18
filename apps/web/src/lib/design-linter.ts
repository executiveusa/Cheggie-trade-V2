export const FORBIDDEN_TERMS = ["OpenRouter", "ChatGPT", "guaranteed profit", "Bloomberg terminal data"];

export function lintCopy(copy: string) {
  return FORBIDDEN_TERMS.filter((term) => copy.includes(term));
}
