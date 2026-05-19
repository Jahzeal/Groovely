import { Response } from 'express';
import { AuthRequest } from '../types/request';
import { sendSuccess } from '../helpers/response';
import { SuccessMessages } from '../constants';

export const getCreatorData = async (req: AuthRequest, res: Response): Promise<void> => {
  const creatorData = {
    role: 'creator',
    userId: req.userId,
    message: 'Creator dashboard is ready. Specific features will be added soon.'
  };

  sendSuccess(res, creatorData, SuccessMessages.CREATOR_DATA_FETCHED);
};