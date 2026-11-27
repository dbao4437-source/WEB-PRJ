import { useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import './NotificationCenter.css';

type AppNotification = {
  _id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  readAt: string | null;
};

const apiBase = 'http://localhost:5000/api/notifications';

const base64UrlToBytes = (value: string) => {
  const padding = '='.repeat((4 - value.length % 4) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
};

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [webPushConfigured, setWebPushConfigured] = useState(false);
  const [browserPushEnabled, setBrowserPushEnabled] = useState(false);
  const [isPushBusy, setIsPushBusy] = useState(false);
  const [error, setError] = useState('');
  const [pushMessage, setPushMessage] = useState('');

  useEffect(() => {
    let active = true;
    const loadNotifications = async () => {
      try {
        const response = await fetch(apiBase, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Không thể tải thông báo');
        if (!active) return;
        setItems(Array.isArray(result.data.items) ? result.data.items : []);
        setUnreadCount(Number(result.data.unreadCount) || 0);
        setWebPushConfigured(Boolean(result.data.webPushConfigured));
        setError('');
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Không thể tải thông báo');
      }
    };

    loadNotifications();
    const timer = window.setInterval(loadNotifications, 30_000);
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => registration.pushManager.getSubscription())
        .then((subscription) => { if (active) setBrowserPushEnabled(Boolean(subscription)); })
        .catch((registrationError) => {
          if (active) setPushMessage(registrationError instanceof Error ? registrationError.message : 'Không thể khởi tạo thông báo trình duyệt');
        });
    }

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const markRead = async (item: AppNotification) => {
    if (item.readAt) return;
    try {
      const response = await fetch(`${apiBase}/${item._id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Không thể cập nhật thông báo');
      setItems((current) => current.map((notification) => notification._id === item._id
        ? { ...notification, readAt: result.data.readAt || new Date().toISOString() }
        : notification));
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (readError) {
      setError(readError instanceof Error ? readError.message : 'Không thể cập nhật thông báo');
    }
  };

  const markAllRead = async () => {
    try {
      const response = await fetch(`${apiBase}/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Không thể đánh dấu đã đọc');
      const readAt = new Date().toISOString();
      setItems((current) => current.map((item) => ({ ...item, readAt: item.readAt || readAt })));
      setUnreadCount(0);
    } catch (readError) {
      setError(readError instanceof Error ? readError.message : 'Không thể đánh dấu đã đọc');
    }
  };

  const enableBrowserPush = async () => {
    setIsPushBusy(true);
    setPushMessage('');
    try {
      if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        throw new Error('Trình duyệt này chưa hỗ trợ thông báo đẩy');
      }
      if (!webPushConfigured) throw new Error('Backend chưa cấu hình khóa Web Push');
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') throw new Error('Bạn chưa cấp quyền thông báo cho trình duyệt');

      const keyResponse = await fetch(`${apiBase}/push-config`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const keyResult = await keyResponse.json();
      if (!keyResponse.ok) throw new Error(keyResult.message || 'Không thể tải khóa Web Push');

      const registration = await navigator.serviceWorker.register('/sw.js');
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: base64UrlToBytes(keyResult.data.publicKey),
        });
      }

      const saveResponse = await fetch(`${apiBase}/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(subscription.toJSON()),
      });
      const saveResult = await saveResponse.json();
      if (!saveResponse.ok) throw new Error(saveResult.message || 'Không thể lưu thiết bị nhận thông báo');
      setBrowserPushEnabled(true);
      setPushMessage('Đã bật thông báo trình duyệt.');
    } catch (pushError) {
      setPushMessage(pushError instanceof Error ? pushError.message : 'Không thể bật thông báo trình duyệt');
    } finally {
      setIsPushBusy(false);
    }
  };

  const disableBrowserPush = async () => {
    setIsPushBusy(true);
    setPushMessage('');
    try {
      const registration = await navigator.serviceWorker.getRegistration('/');
      const subscription = await registration?.pushManager.getSubscription();
      if (!subscription) {
        setBrowserPushEnabled(false);
        return;
      }
      const response = await fetch(`${apiBase}/subscriptions`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Không thể tắt thông báo trình duyệt');
      await subscription.unsubscribe();
      setBrowserPushEnabled(false);
      setPushMessage('Đã tắt thông báo trình duyệt.');
    } catch (pushError) {
      setPushMessage(pushError instanceof Error ? pushError.message : 'Không thể tắt thông báo trình duyệt');
    } finally {
      setIsPushBusy(false);
    }
  };

  return (
    <div className="notification-center">
      <button
        type="button"
        className="notification-icon"
        title="Thông báo"
        aria-label={`Thông báo${unreadCount ? `, ${unreadCount} chưa đọc` : ''}`}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <Bell size={17} color="#713F12"/>
        {unreadCount > 0 && <span className="notification-unread-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>
      {isOpen && (
        <section className="notification-panel" aria-label="Danh sách thông báo">
          <header className="notification-panel-header">
            <div><h2>Thông báo</h2><span>{unreadCount ? `${unreadCount} chưa đọc` : 'Đã cập nhật'}</span></div>
            {unreadCount > 0 && <button type="button" onClick={markAllRead}><CheckCheck size={15}/> Đọc tất cả</button>}
          </header>
          <div className="notification-push-settings">
            <div><strong>Thông báo trình duyệt</strong><span>{browserPushEnabled ? 'Đã bật trên thiết bị này' : 'Nhận thông báo kể cả khi đóng trang'}</span></div>
            {browserPushEnabled
              ? <button type="button" disabled={isPushBusy} onClick={disableBrowserPush}>Tắt</button>
              : <button type="button" disabled={isPushBusy || !webPushConfigured} onClick={enableBrowserPush}>{isPushBusy ? 'Đang bật...' : 'Bật'}</button>}
          </div>
          {!webPushConfigured && <p className="notification-push-hint">Web Push chưa được cấu hình trên backend; thông báo trong ứng dụng vẫn hoạt động.</p>}
          {pushMessage && <p className="notification-push-message" role="status">{pushMessage}</p>}
          {error && <p className="notification-error" role="alert">{error}</p>}
          <div className="notification-list">
            {items.length === 0 && !error ? <p className="notification-empty">Chưa có thông báo nào.</p> : items.map((item) => (
              <button
                type="button"
                key={item._id}
                className={`notification-item${item.readAt ? '' : ' unread'}`}
                onClick={() => markRead(item)}
              >
                <span className="notification-item-icon"><Bell size={15}/></span>
                <span className="notification-item-content">
                  <strong>{item.title}</strong>
                  <span>{item.message}</span>
                  <time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString('vi-VN')}</time>
                </span>
                {!item.readAt && <span className="notification-item-dot"/>}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
