import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { verifyToken, extractTokenFromHeader } from '../../utils/jwt';

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return true;
    }

    try {
      const decoded = verifyToken(token);
      request.userId = decoded.id;
      request.userWallet = decoded.wallet;
      request.userEmail = decoded.email;
      request.userRole = decoded.role;
      request.user = decoded;
    } catch (_) {
      // Ignored for optional auth
    }

    return true;
  }
}
