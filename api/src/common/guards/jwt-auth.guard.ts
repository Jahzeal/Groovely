import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { verifyToken, extractTokenFromHeader } from '../../utils/jwt';
import { ErrorMessages } from '../../constants';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      throw new UnauthorizedException(ErrorMessages.NO_TOKEN);
    }

    try {
      const decoded = verifyToken(token);
      
      // Inject standard Express variables for compatibility
      request.userId = decoded.id;
      request.userWallet = decoded.wallet;
      request.userEmail = decoded.email;
      request.userRole = decoded.role;
      
      // Inject standard NestJS user variable
      request.user = decoded;

      return true;
    } catch (error) {
      throw new UnauthorizedException(ErrorMessages.INVALID_TOKEN);
    }
  }
}
