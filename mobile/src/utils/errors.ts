/**
 * Returns a human-readable message from an unknown caught value.
 * Use this in catch blocks instead of `catch (error: any)`.
 *
 * @example
 * try { ... }
 * catch (error) { return { status: 500, message: getErrorMessage(error) }; }
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred';
}
