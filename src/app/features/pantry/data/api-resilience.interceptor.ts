import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { catchError, retry, throwError, timer, timeout, TimeoutError } from 'rxjs';
import { ProductApiError } from './product-api-error';

interface ApiErrorEnvelope {
  error?: {
    message?: string;
    fieldErrors?: Record<string, string>;
  };
}

export const apiResilienceInterceptor: HttpInterceptorFn = (request, next) => {
  const response = next(request).pipe(timeout({ first: 10000 }));
  const retriedResponse = request.method === 'GET'
    ? response.pipe(retry({
        count: 1,
        delay: (error: unknown) => {
          if (error instanceof TimeoutError) return timer(350);
          if (error instanceof HttpErrorResponse && (error.status === 0 || error.status >= 500)) {
            return timer(350);
          }
          return throwError(() => error);
        }
      }))
    : response;

  return retriedResponse.pipe(catchError((error: unknown) => {
    if (error instanceof HttpErrorResponse) {
      const payload = error.error as ApiErrorEnvelope | null;
      const apiMessage = payload?.error?.message;
      const message = error.status === 0
        ? 'The server could not be reached. Check the connection and try again.'
        : apiMessage ?? 'The request could not be completed. Try again.';
      return throwError(() => new ProductApiError(message, error.status, payload?.error?.fieldErrors ?? {}));
    }
    if (error instanceof TimeoutError) {
      return throwError(() => new ProductApiError('The request timed out. Try again.'));
    }
    return throwError(() => new ProductApiError('An unexpected request error occurred. Try again.'));
  }));
};
