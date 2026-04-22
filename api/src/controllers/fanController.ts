import { Response } from 'express';
import { AuthRequest } from '../types/request';
import { sendSuccess } from '../helpers/response';
import { SuccessMessages } from '../constants';

export const getFanData = async (req: AuthRequest, res: Response): Promise<void> => {
  const fanData = {
    role: 'fan',
    userId: req.userId,
    message: 'Fan dashboard is ready. Specific features will be added soon.'
  };

  sendSuccess(res, fanData, SuccessMessages.FAN_DATA_FETCHED);
};