import React, { useState, useEffect } from 'react';
import { ShieldCheck, Mail, Phone, Building2, User } from 'lucide-react';
import { api } from '../services/api';

export const StaffPage: React.FC = () => {
  const [staff, setStaff] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/staff');
      if (res.success) setStaff(res.data);
    } catch (err) {
      console.error('Failed to load staff', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  return (
    <div className="page-wrapper space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Staff & Access Permissions</h1>
          <p className="page-subtitle">
            Role assignments and store permissions for cashiers, boutique managers, and store owners.
          </p>
        </div>
      </div>

      {/* Staff Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-neutral-200/60 rounded-2xl" />
          ))}
        </div>
      ) : staff.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">
            <User className="w-6 h-6 text-label-tertiary" />
          </div>
          <h3 className="empty-state-title">No staff members found</h3>
          <p className="empty-state-desc">Staff accounts configured in the system will be displayed here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {staff.map((u) => (
            <div
              key={u.id}
              className="card-hover p-6 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="badge badge-action">
                    {u.role?.name || 'Staff Member'}
                  </span>
                  <span className="flex items-center gap-1.5 text-2xs text-success-600 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-success-500" />
                    <span>Active</span>
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-full bg-surface-secondary border border-separator flex items-center justify-center font-bold text-sm text-label-primary shrink-0">
                    {u.name?.slice(0, 2).toUpperCase() || 'ST'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-label-primary text-sm">{u.name}</h3>
                    <div className="text-2xs text-label-secondary font-mono">{u.role?.name === 'Owner' ? 'Administrator' : 'Cashier Operator'}</div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-label-secondary pt-1">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-label-tertiary shrink-0" />
                    <span className="truncate">{u.email}</span>
                  </div>
                  {u.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-label-tertiary shrink-0" />
                      <span className="font-mono">{u.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-separator/60 flex items-center justify-between text-2xs text-label-secondary">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-label-tertiary" />
                  <span>{u.branch?.name || 'Flagship Colombo 03'}</span>
                </span>
                <span className="font-semibold text-label-primary">
                  {u.role?.name === 'Owner' ? 'Full Control' : 'POS Access'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
