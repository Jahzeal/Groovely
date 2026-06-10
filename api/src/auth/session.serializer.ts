import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private authService: AuthService) {
    super();
  }

  serializeUser(user: any, done: Function) {
    done(null, user.id);
  }

  async deserializeUser(payload: any, done: Function) {
    try {
      const user = await this.authService.findUserById(payload);
      done(null, user);
    } catch (err) {
      done(err);
    }
  }
}
