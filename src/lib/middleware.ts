import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken, JWTPayload } from './auth';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

// Middleware to authenticate requests
export function withAuth<T = unknown>(handler: (req: AuthenticatedRequest, context: T) => Promise<NextResponse>) {
  return async (req: NextRequest, context: T): Promise<NextResponse> => {
    try {
      const token = extractToken(req);
      
      if (!token) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      const user = verifyToken(token);
      
      if (!user) {
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        );
      }

      // Add user to request object
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = user;

      return await handler(authenticatedReq, context);
    } catch (error) {
      console.error('Authentication middleware error:', error);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      );
    }
  };
}

// Middleware to check admin role
export function withAdminAuth<T = unknown>(handler: (req: AuthenticatedRequest, context: T) => Promise<NextResponse>) {
  return withAuth(async (req: AuthenticatedRequest, context: T): Promise<NextResponse> => {
    if (req.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    return await handler(req, context);
  });
}

// CORS middleware
export function withCORS(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const response = await handler(req);
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
  };
}