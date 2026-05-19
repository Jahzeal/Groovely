import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/request';
import { sendForbidden } from '../helpers/response';
import { ErrorMessages } from '../constants';

export const roleCheck = (allowedRole: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const userRole = req.userRole;

    if (userRole !== allowedRole) {
      sendForbidden(res, ErrorMessages.ACCESS_DENIED);
      return;
    }

    next();
  };
};

export const requireCreator = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.userRole !== 'creator') {
    sendForbidden(res, ErrorMessages.ACCESS_DENIED);
    return;
  }
  next();
};

export const requireFan = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.userRole !== 'fan') {
    sendForbidden(res, ErrorMessages.ACCESS_DENIED);
    return;
  }
  next();
};