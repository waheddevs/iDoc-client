// Only recognize the backend prompt's explicit fallback; do not infer answer quality.
export function isInsufficientAnswer(content: string) {
  return /^(?:the )?available documents do not provide enough information[.!]?$/i.test(
    content.trim(),
  );
}
