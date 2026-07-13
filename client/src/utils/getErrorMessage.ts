type RtkQueryLikeError = {
  data?: { message?: string; code?: string };
};

function isRtkQueryLikeError(error: unknown): error is RtkQueryLikeError {
  return typeof error === 'object' && error !== null && 'data' in error;
}

/**
 * Extracts a user-facing message from either an RTK Query error
 * (`{ data: { message } }`) or a plain `Error` (`{ message }`), falling
 * back if neither shape matches.
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (isRtkQueryLikeError(error) && typeof error.data?.message === 'string') {
    return error.data.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

/** Extracts the server's structured error `code` (e.g. `EMAIL_NOT_VERIFIED`) from an RTK Query error, if present. */
export function getErrorCode(error: unknown): string | undefined {
  return isRtkQueryLikeError(error) ? error.data?.code : undefined;
}
