// Prosty rate limit trzymany w pamieci serwera.
// Do tego projektu wystarcza, chociaz w duzym prodzie poszedlby raczej Redis albo cos podobnego.
const buckets = new Map();

export function utworzLimiter({ windowMs, maxAttempts, keyGenerator, onLimitExceeded = null }) {
  return async function rateLimiter(request, response, next) {
    const now = Date.now();
    const key = keyGenerator(request);
    const current = buckets.get(key);

    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (current.count >= maxAttempts) {
      if (typeof onLimitExceeded === "function") {
        await safeCallLimitHandler(onLimitExceeded, request, { key, count: current.count, resetAt: current.resetAt });
      }
      response.status(429).json({
        error: "too_many_attempts",
        message: "Too many attempts. Try again later."
      });
      return;
    }

    current.count += 1;
    next();
  };
}

export function getClientIp(request) {
  return request.ip || request.socket?.remoteAddress || "unknown";
}

async function safeCallLimitHandler(handler, request, bucket) {
  try {
    await handler(request, bucket);
  } catch (error) {
    console.error("Rate limit audit hook failed:", error);
  }
}
