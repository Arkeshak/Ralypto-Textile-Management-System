import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';

export const requirePermission = (permission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { permissions, roleName } = req.user;

    // Owner role or wildcard '*' grants full access
    if (roleName === 'Owner' || permissions.includes('*') || permissions.includes(permission)) {
      next();
      return;
    }

    res.status(403).json({
      success: false,
      message: `Forbidden: You do not have permission '${permission}' to perform this action.`,
    });
  };
};
