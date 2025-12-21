import { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { apiClient } from '../lib/api-client';
import { Notification } from '../lib/types';

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await apiClient.getNotifications();
      setNotifications(data.notifications);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await apiClient.markNotificationRead(id);
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to mark notification as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiClient.markAllNotificationsRead();
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to mark all notifications as read');
    }
  };

  const getNotificationIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      DEBATE_INVITATION: '📬',
      DEBATE_STARTING: '🚀',
      DEBATE_COMPLETED: '✅',
      SCORE_SUBMITTED: '📊',
      ROLE_ASSIGNED: '👤',
      SYSTEM: 'ℹ️',
    };
    return icons[type] || 'ℹ️';
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-white text-center">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Notifications</h1>
          {notifications.some((n) => !n.isRead) && (
            <button
              onClick={handleMarkAllRead}
              className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
            >
              Mark All Read
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-white">
            {error}
          </div>
        )}

        {notifications.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 text-white text-center">
            <p className="text-xl">No notifications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white/10 backdrop-blur-lg rounded-lg p-4 ${
                  !notification.isRead ? 'border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <span className="text-white font-semibold">
                        {notification.type.replace(/_/g, ' ')}
                      </span>
                      {!notification.isRead && (
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          NEW
                        </span>
                      )}
                    </div>

                    {notification.payload && (
                      <div className="text-blue-200 text-sm space-y-1">
                        {notification.payload.debateTitle && (
                          <div>Debate: {notification.payload.debateTitle}</div>
                        )}
                        {notification.payload.role && (
                          <div>Role: {notification.payload.role}</div>
                        )}
                        {notification.payload.teamSide && (
                          <div>Team: {notification.payload.teamSide}</div>
                        )}
                        {notification.payload.category && (
                          <div>Category: {notification.payload.category}</div>
                        )}
                        {notification.payload.score !== undefined && (
                          <div>
                            Score: {notification.payload.score}/
                            {notification.payload.maxScore}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="text-blue-300 text-xs mt-2">
                      {new Date(notification.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkRead(notification.id)}
                      className="px-3 py-1 bg-white/20 text-white text-sm rounded hover:bg-white/30 transition-colors"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
