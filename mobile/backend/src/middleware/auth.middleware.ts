import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        role?: string;
      };
    }
  }
}

/**
 * Authentication middleware - validates JWT token from Supabase
 */
export async function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'No authorization token provided'
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token with Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token'
      });
      return;
    }

    // Attach user to request
    req.user = {
      id: data.user.id,
      email: data.user.email,
      role: data.user.role
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      error: 'Authentication failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Optional authentication middleware - doesn't block if no token provided
 * Useful for endpoints that work with or without authentication
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user
      next();
      return;
    }

    const token = authHeader.substring(7);
    const { data, error } = await supabase.auth.getUser(token);

    if (!error && data.user) {
      req.user = {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role
      };
    }

    next();
  } catch (error) {
    // Don't block on auth errors for optional auth
    next();
  }
}
