const VISITOR_ID_PATTERN = /^[a-f0-9]{32}$/;

export function validateVisitorId(id: string): void {
  if (!VISITOR_ID_PATTERN.test(id)) throw new Error("Invalid visitor ID");
}

export function isValidVisitorId(id: string): boolean {
  return VISITOR_ID_PATTERN.test(id);
}
