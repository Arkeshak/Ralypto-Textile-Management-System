import { Request } from 'express';

export interface AuthUser {
  id: string;
  businessId: string;
  branchId?: string | null;
  name: string;
  email: string;
  roleId: string;
  roleName: string;
  permissions: string[];
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
  businessId?: string;
  branchId?: string;
}
