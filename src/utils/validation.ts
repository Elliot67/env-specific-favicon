export function isRegexValid(pattern: string): boolean {
  try {
    new RegExp(pattern);
    return true;
  } catch (e) {
    return false;
  }
}

export function isColorHexValid(color: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(color);
}
