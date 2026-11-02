export class ProductApiError extends Error {
  constructor(
    message: string,
    readonly status: number | null = null,
    readonly fieldErrors: Record<string, string> = {}
  ) {
    super(message);
    this.name = 'ProductApiError';
  }
}
