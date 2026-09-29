import React from 'react';
import { X, Bell, CheckCircle2, AlertTriangle, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllAsRead: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ 
  isOpen, 
  onClose, 
  notifications,
  onMarkAllAsRead
}) => {
  if (!isOpen) return null;

  const unreadNotifications = notifications.filter(n => !n.isRead);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-white border border-slate-300 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-100 rounded-xl text-indigo-700">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Operational Notifications</h3>
              <p className="text-xs text-slate-500 font-semibold">Vrishti AI Station & System Alert Logs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-200/60 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="p-6 space-y-3 max-h-[400px] overflow-y-auto">
          {unreadNotifications.length === 0 ? (
            <div className="py-12 px-6 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-black text-slate-900">All Notifications Read</h4>
              <p className="text-xs font-semibold text-slate-500 max-w-xs mx-auto">
                No new unread alerts for the selected weather station and forecast date.
              </p>
            </div>
          ) : (
            unreadNotifications.map((n) => {
              const Icon = n.type === 'error' ? AlertCircle :
                           n.type === 'warning' ? AlertTriangle :
                           n.type === 'success' ? CheckCircle2 : Sparkles;
              return (
                <div 
                  key={n.id} 
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/80 transition-all flex items-start space-x-3 shadow-sm"
                >
                  <div className={`p-2 rounded-lg shrink-0 ${
                    n.type === 'error' ? 'bg-rose-100 text-rose-700' :
                    n.type === 'warning' ? 'bg-amber-100 text-amber-700' :
                    n.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-slate-900">{n.title}</h4>
                      <span className="text-[10px] text-slate-400 font-semibold">{n.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 font-semibold mt-1 leading-snug">{n.description}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end space-x-2">
          {unreadNotifications.length > 0 && (
            <button
              type="button"
              onClick={onMarkAllAsRead}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-sm"
            >
              Mark All as Read
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-extrabold rounded-xl transition-all cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
