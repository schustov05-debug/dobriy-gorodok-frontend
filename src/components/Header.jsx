// src/components/Header.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import logoImg from '../assets/logo.png';

const NavLink = ({ to, children }) => {
    const location = useLocation();
    const isActive = location.pathname === to;
    return (
        <Link to={to} style={{
            color: '#000000',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: isActive ? '700' : '400',
            borderBottom: isActive ? '2px solid #1E2D24' : '2px solid transparent',
            paddingBottom: '5px',
            transition: 'all 0.2s ease',
        }}>
            {children}
        </Link>
    );
};

export default function Header() {
    const { user, login, logout, notifications, clearNotifications, markAsRead, unreadCount } = useAuth();

    const [modalOpen, setModalOpen] = useState(false);
    const [mode, setMode] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Стейты для показа/скрытия паролей
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    // Стейт для выпадающего списка уведомлений
    const [showNotifs, setShowNotifs] = useState(false);
    const notifsRef = useRef(null);

    useEffect(() => {
        // Функция, которая срабатывает при клике
        const handleClickOutside = (event) => {
            // Если клик был вне элемента (notifsRef.current) и не по кнопке открытия
            if (notifsRef.current && !notifsRef.current.contains(event.target)) {
                setShowNotifs(false);
            }
        };

        // Подписываемся на клики, если окно открыто
        if (showNotifs) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        // Очистка: удаляем подписку при закрытии или размонтировании
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showNotifs]);
    
    const openModal = (initialMode = 'login') => {
        setMode(initialMode);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setError('');
        setShowPassword(false);
        setShowConfirmPassword(false);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setError('');
        setShowPassword(false);
        setShowConfirmPassword(false);
    };
    
    const switchMode = (newMode) => {
        setMode(newMode);
        setError('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setShowPassword(false);
        setShowConfirmPassword(false);
    };
    
    const toggleNotifications = () => {
        if (showNotifs === false) { 
            markAsRead();
        }
        setShowNotifs(!showNotifs);
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (mode === 'register' && password !== confirmPassword) {
            setError('Пароли не совпадают');
            return;
        }
        if (password.length < 6) {
            setError('Пароль должен быть не менее 6 символов');
            return;
        }
        setLoading(true);
        try {
            const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
            const response = await api.post(endpoint, { email, password });
            login(response.data.user, response.data.token);
            closeModal();
        } catch (err) {
            setError(err.response?.data?.error || 'Произошла ошибка. Попробуйте ещё раз.');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '12px 16px',
        border: '1px solid #D0D0D0',
        borderRadius: '8px',
        fontSize: '15px',
        outline: 'none',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
        transition: 'border-color 0.2s',
        backgroundColor: '#F9F9F9',
    };

    return (
        <>
            <header style={{
                background: '#FFFFFF',
                borderBottom: '1px solid #E5E5E5',
                height: '80px',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                width: '100%',
            }}>
                <div style={{
                    maxWidth: '1350px', // Увеличено с 1100px, чтобы элементы были ближе к краям
                    margin: '0 auto',       
                    padding: '0 40px',      
                    height: '100%',          
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxSizing: 'border-box'
                }}>
                <Link to="/">
                    <img src={logoImg} alt="Добрый Городок"
                        style={{ marginTop: 5, height: '75px', width: 'auto', objectFit: 'contain' }} />
                </Link>

                <nav style={{ 
                    display: 'flex', 
                    gap: '35px', 
                    alignItems: 'center',
                    marginTop: '10px' // Добавлено, чтобы немного опустить вкладки вниз
                }}>
                    <NavLink to="/">Главная</NavLink>
                    <NavLink to="/pets">Питомцы</NavLink>
                    <NavLink to="/team">О команде</NavLink>
                    <NavLink to="/about">О приюте</NavLink>
                    <NavLink to="/help">Помощь приюту</NavLink>
                    <NavLink to="/articles">Полезные советы</NavLink>
                </nav>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <Link to="/profile" style={{
                                textDecoration: 'none',
                                color: '#1E2D24',
                                fontWeight: '600',
                                fontSize: '15px',
                            }}>
                                Профиль
                            </Link>

                            <Link to="/profile" style={{ display: 'flex', alignItems: 'center', color: '#365E42' }}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="8" r="4" stroke="#365E42" strokeWidth="2"/>
                                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#365E42" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                            </Link>

                            <div style={{ position: 'relative' }} ref={notifsRef}>
                                <button 
                                    onClick={toggleNotifications}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        color: '#365E42',
                                        position: 'relative'
                                    }}
                                    title="Уведомления"
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" fill="#365E42"/>
                                    </svg>
                                    
                                    {unreadCount > 0 && (
                                        <span style={{
                                            position: 'absolute',
                                            top: '0px',
                                            right: '0px',
                                            background: '#E74C3C',
                                            color: '#FFF',
                                            borderRadius: '50%',
                                            width: '16px',
                                            height: '16px',
                                            fontSize: '10px',
                                            fontWeight: 'bold',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '2px solid #FFF'
                                        }}>
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                {showNotifs && (
                                    <div 
                                    style={{
                                        position: 'absolute',
                                        top: '120%',
                                        right: '-10px',
                                        width: '320px',
                                        background: '#FFFFFF',
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                                        padding: '16px',
                                        zIndex: 1000,
                                        border: '1px solid #E5E5E5',
                                        cursor: 'default'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                            <h4 style={{ margin: 0, fontSize: '16px', color: '#1E2D24' }}>Уведомления</h4>
                                            {notifications?.length > 0 && (
                                                <button onClick={clearNotifications} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '13px', padding: 0 }}>
                                                    Очистить
                                                </button>
                                            )}
                                        </div>
                                        
                                        {(!notifications || notifications.length === 0) ? (
                                            <p style={{ margin: 0, color: '#888', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>
                                                Нет новых уведомлений
                                            </p>
                                        ) : (
                                            <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                {notifications.map(n => (
                                                    <div key={n.id} style={{ background: '#FDF9EE', padding: '12px', borderRadius: '8px' }}>
                                                        <p style={{ margin: '0 0 6px', fontSize: '14px', color: '#333', lineHeight: '1.4' }}>{n.message}</p>
                                                        <span style={{ fontSize: '12px', color: '#999' }}>
                                                            {new Date(n.date).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' })}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => openModal('login')} style={{
                            background: '#365E42',
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '10px 24px',
                            borderRadius: '8px',
                            fontWeight: '700',
                            fontSize: '15px',
                            cursor: 'pointer',
                            transition: 'background 0.2s ease',
                        }}>
                            Войти на сайт
                        </button>
                    )}
                </div>
                </div>
            </header>

            {modalOpen && (
                <div onClick={closeModal} style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                }}>
                    <div onClick={(e) => e.stopPropagation()} style={{
                        background: '#FDF9EE',
                        borderRadius: '16px',
                        padding: '40px',
                        width: '100%',
                        maxWidth: '460px',
                        position: 'relative',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                    }}>
                        <button onClick={closeModal} style={{
                            position: 'absolute',
                            top: '16px',
                            right: '20px',
                            background: 'none',
                            border: 'none',
                            fontSize: '22px',
                            cursor: 'pointer',
                            color: '#666',
                        }}>✕</button>

                        <h2 style={{
                            textAlign: 'center',
                            fontSize: '26px',
                            fontWeight: '700',
                            color: '#1E2D24',
                            marginBottom: '24px',
                            marginTop: 0,
                        }}>
                            {mode === 'login' ? 'Вход на сайт' : 'Регистрация'}
                        </h2>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '30px',
                            marginBottom: '28px',
                            borderBottom: '1px solid #E0E0E0',
                        }}>
                            {['login', 'register'].map((m) => (
                                <button key={m} onClick={() => switchMode(m)} style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '16px',
                                    fontWeight: mode === m ? '700' : '400',
                                    color: mode === m ? '#365E42' : '#888',
                                    cursor: 'pointer',
                                    paddingBottom: '12px',
                                    borderBottom: mode === m ? '2px solid #365E42' : '2px solid transparent',
                                    transition: 'all 0.2s',
                                }}>
                                    {m === 'login' ? 'Войти' : 'Зарегистрироваться'}
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ fontSize: '14px', fontWeight: '500', color: '#333', display: 'block', marginBottom: '6px' }}>Почта</label>
                                <input type="email" placeholder="Введите email"
                                    value={email} onChange={(e) => setEmail(e.target.value)}
                                    style={inputStyle} required />
                            </div>
                            <div>
                                <label style={{ fontSize: '14px', fontWeight: '500', color: '#333', display: 'block', marginBottom: '6px' }}>Пароль</label>
                                <div style={{ position: 'relative' }}>
                                    <input type={showPassword ? 'text' : 'password'} placeholder="Введите пароль"
                                        value={password} onChange={(e) => setPassword(e.target.value)}
                                        style={{ ...inputStyle, paddingRight: '44px' }} required />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                                        style={{
                                            position: 'absolute',
                                            right: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            padding: 0,
                                            cursor: 'pointer',
                                            color: '#888',
                                            display: 'flex',
                                            alignItems: 'center',
                                        }}
                                    >
                                        {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                    </button>
                                </div>
                            </div>
                            {mode === 'register' && (
                                <div>
                                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#333', display: 'block', marginBottom: '6px' }}>Подтверждение пароля</label>
                                    <div style={{ position: 'relative' }}>
                                        <input type={showConfirmPassword ? 'text' : 'password'} placeholder="Повторите пароль"
                                            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                            style={{ ...inputStyle, paddingRight: '44px' }} required />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                                            aria-label={showConfirmPassword ? 'Скрыть пароль' : 'Показать пароль'}
                                            style={{
                                                position: 'absolute',
                                                right: '12px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'none',
                                                border: 'none',
                                                padding: 0,
                                                cursor: 'pointer',
                                                color: '#888',
                                                display: 'flex',
                                                alignItems: 'center',
                                            }}
                                        >
                                            {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            )}
                            {error && (
                                <div style={{
                                    background: '#FFF0F0',
                                    border: '1px solid #F5C6C6',
                                    borderRadius: '8px',
                                    padding: '10px 14px',
                                    color: '#C0392B',
                                    fontSize: '14px',
                                }}>{error}</div>
                            )}
                            <button type="submit" disabled={loading} style={{
                                background: loading ? '#8BA393' : '#365E42',
                                color: '#FFFFFF',
                                border: 'none',
                                padding: '14px',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: '700',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'background 0.2s',
                                marginTop: '4px',
                            }}>
                                {loading ? 'Загрузка...' : (mode === 'login' ? 'Войти' : 'Зарегистрироваться')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}