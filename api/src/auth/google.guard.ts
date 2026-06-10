import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { role, prompt } = request.query;
    if (!request.session) {
      request.session = {};
    }
    if (role) {
      request.session.googleRole = role;
    }
    if (prompt) {
      request.session.googlePrompt = prompt;
    }
    return super.canActivate(context) as boolean;
  }

  getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const prompt = request.session?.googlePrompt || request.query?.prompt;
    if (prompt) {
      return {
        prompt,
      };
    }
    return undefined;
  }
}
