// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Добавляем состояние для уведомлений
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    // Подтягиваем уведомления при загрузке
    const savedNotifs = localStorage.getItem('notifications');
    if (savedNotifs) {
      setNotifications(JSON.parse(savedNotifs));
    }
    
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Функция для создания нового уведомления
  const addNotification = (message) => {
    const newNotif = {
      id: Date.now(),
      message,
      date: new Date().toISOString(),
    };
    setNotifications((prev) => {
      const updated = [newNotif, ...prev]; // Новые сверху
      localStorage.setItem('notifications', JSON.stringify(updated));
      return updated;
    });
    setUnreadCount(prev => prev + 1);
  };

  const markAsRead = () => {
    setUnreadCount(0);
  };

  // Функция для очистки всех уведомлений
  const clearNotifications = () => {
    setNotifications([]);
    localStorage.removeItem('notifications');
  };

  return (
    <AuthContext.Provider value={{ 
      user, login, logout, loading, 
      notifications, addNotification, clearNotifications,
      markAsRead, unreadCount
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}