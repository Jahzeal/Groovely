import { Response } from 'express';
import { HttpStatus } from '../constants';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export const sendSuccess = <T>(
  res: Response, 
  data?: T, 
  message: string = 'Operation successful'
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data
  };
  return res.status(HttpStatus.OK).json(response);
};

export const sendCreated = <T>(
  res: Response, 
  data: T, 
  message: string = 'Resource created successfully'
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data
  };
  return res.status(HttpStatus.CREATED).json(response);
};

export const sendNoContent = (res: Response): Response => {
  return res.status(HttpStatus.NO_CONTENT).send();
};

export const sendBadRequest = (res: Response, error: string): Response => {
  const response: ApiResponse = {
    success: false,
    error
  };
  return res.status(HttpStatus.BAD_REQUEST).json(response);
};

export const sendUnauthorized = (
  res: Response, 
  error: string = 'You are not logged in. Please login to continue.'
): Response => {
  const response: ApiResponse = {
    success: false,
    error
  };
  return res.status(HttpStatus.UNAUTHORIZED).json(response);
};


export const sendForbidden = (
  res: Response, 
  error: string = 'You do not have permission to access this resource.'
): Response => {
  const response: ApiResponse = {
    success: false,
    error
  };
  return res.status(HttpStatus.FORBIDDEN).json(response);
};

export const sendNotFound = (
  res: Response, 
  error: string = 'Resource not found'
): Response => {
  const response: ApiResponse = {
    success: false,
    error
  };
  return res.status(HttpStatus.NOT_FOUND).json(response);
};

export const sendConflict = (
  res: Response, 
  error: string = 'Resource already exists'
): Response => {
  const response: ApiResponse = {
    success: false,
    error
  };
  return res.status(HttpStatus.CONFLICT).json(response);
};


export const sendValidationError = (
  res: Response, 
  error: string
): Response => {
  const response: ApiResponse = {
    success: false,
    error
  };
  return res.status(HttpStatus.UNPROCESSABLE_ENTITY).json(response);
};

export const sendInternalError = (
  res: Response, 
  error: string = 'Something went wrong on our server. Please try again later.'
): Response => {
  const response: ApiResponse = {
    success: false,
    error
  };
  return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
};