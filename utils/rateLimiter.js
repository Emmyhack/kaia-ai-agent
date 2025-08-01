// Simple in-memory rate limiter
const rateLimitMap = new Map();

export const rateLimiter = {
  // Rate limit configuration
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // Max requests per window
  
  // Check if request is allowed
  isAllowed: (identifier) => {
    const now = Date.now();
    const windowStart = now - rateLimiter.windowMs;
    
    if (!rateLimitMap.has(identifier)) {
      rateLimitMap.set(identifier, []);
    }
    
    const requests = rateLimitMap.get(identifier);
    
    // Remove old requests outside the window
    const validRequests = requests.filter(timestamp => timestamp > windowStart);
    rateLimitMap.set(identifier, validRequests);
    
    // Check if under limit
    if (validRequests.length >= rateLimiter.maxRequests) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    return true;
  },
  
  // Get remaining requests
  getRemaining: (identifier) => {
    const now = Date.now();
    const windowStart = now - rateLimiter.windowMs;
    
    if (!rateLimitMap.has(identifier)) {
      return rateLimiter.maxRequests;
    }
    
    const requests = rateLimitMap.get(identifier);
    const validRequests = requests.filter(timestamp => timestamp > windowStart);
    
    return Math.max(0, rateLimiter.maxRequests - validRequests.length);
  },
  
  // Reset for testing
  reset: () => {
    rateLimitMap.clear();
  }
};

// Middleware for API routes
export const rateLimitMiddleware = (handler) => {
  return async (req, res) => {
    // Get client identifier (IP or user ID)
    const identifier = req.headers['x-forwarded-for'] || 
                      req.connection.remoteAddress || 
                      req.headers['x-real-ip'] || 
                      'unknown';
    
    if (!rateLimiter.isAllowed(identifier)) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests',
        details: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil(rateLimiter.windowMs / 1000)
      });
    }
    
    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', rateLimiter.maxRequests);
    res.setHeader('X-RateLimit-Remaining', rateLimiter.getRemaining(identifier));
    res.setHeader('X-RateLimit-Reset', new Date(Date.now() + rateLimiter.windowMs).toISOString());
    
    return handler(req, res);
  };
};