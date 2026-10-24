import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import prisma from '../db/prisma';
import { AuthenticatedRequest, AuthUser } from '../types';

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authentication token required. Please sign in.',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string; businessId: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        role: true,
        business: true,
      },
    });

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'User account is inactive or not found.',
      });
      return;
    }

    let parsedPermissions: string[] = [];
    try {
      parsedPermissions = JSON.parse(user.role.permissions);
    } catch {
      parsedPermissions = [];
    }

    const authUser: AuthUser = {
      id: user.id,
      businessId: user.businessId,
      branchId: user.branchId,
      name: user.name,
      email: user.email,
      roleId: user.roleId,
      roleName: user.role.name,
      permissions: parsedPermissions,
    };

    req.user = authUser;
    req.businessId = user.businessId;

    // Support branch switching via header if user has access or is owner/manager
    const headerBranchId = req.headers['x-branch-id'] as string;
    if (headerBranchId) {
      req.branchId = headerBranchId;
    } else {
      req.branchId = user.branchId || undefined;
    }

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication session.',
    });
  }
};
