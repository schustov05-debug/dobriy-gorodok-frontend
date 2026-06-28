// src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Profile() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Данные профиля
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [profileLoading, setProfileLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState('');

    // Только избранное
    const [favorites, setFavorites] = useState([]);
    const [dataLoading, setDataLoading] = useState(false);

    // Если не авторизован — редирект на главную
    useEffect(() => {
        if (!user) navigate('/');
    }, [user, navigate]);

    // Загружаем профиль при входе
    useEffect(() => {
        if (!user) return;
        const fetchProfile = async () => {
            try {
                const res = await api.get('/api/profile');
                setFullName(res.data.full_name || '');
                setPhone(res.data.phone || '');
            } catch (err) {
                console.error('Ошибка загрузки профиля:', err);
            } finally {
                setProfileLoading(false);
            }
        };
        fetchProfile();
    }, [user]);

    // Загружаем только избранное
    useEffect(() => {
        if (!user) return;
        const fetchFavorites = async () => {
            setDataLoading(true);
            try {
                const res = await api.get('/api/favorites');
                setFavorites(res.data);
            } catch (err) {
                console.error('Ошибка загрузки данных:', err);
            } finally {
                setDataLoading(false);
            }
        };
        fetchFavorites();
    }, [user]);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaveError('');
        setSaveSuccess(false);
        setSaveLoading(true);
        try {
            await api.put('/api/profile', { full_name: fullName, phone });
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            setSaveError(err.response?.data?.error || 'Ошибка при сохранении');
        } finally {
            setSaveLoading(false);
        }
    };

    const handleRemoveFavorite = async (petId) => {
        try {
            await api.delete(`/api/favorites/${petId}`);
            setFavorites(prev => prev.filter(f => f.pet_id !== petId));
        } catch (err) {
            console.error('Ошибка удаления из избранного:', err);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Чтобы React не падал до того, как сработает navigate('/')
    if (!user) return null;

    const inputStyle = {
        width: '100%',
        padding: '11px 14px',
        border: '1px solid #D8D8D8',
        borderRadius: '8px',
        fontSize: '15px',
        outline: 'none',
        fontFamily: 'inherit',
        backgroundColor: '#FAFAFA',
        boxSizing: 'border-box',
    };

    return (
        <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', fontFamily: 'sans-serif' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 5%' }}>

                <h1 style={{
                    fontSize: '32px',
                    fontWeight: '700',
                    color: '#1E2D24',
                    marginBottom: '32px',
                    fontStyle: 'normal',
                }}>
                    Личный кабинет
                </h1>

                <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>

                    {/* ── ЛЕВАЯ ЧАСТЬ: Хочу познакомиться (Избранное) ── */}
                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#365E42', margin: '0 0 24px 0' }}>
                            Хочу познакомиться
                        </h2>

                        {dataLoading ? (
                            <p style={{ color: '#888' }}>Загрузка...</p>
                        ) : favorites.length === 0 ? (
                            <div style={{
                                background: '#F5F5F0',
                                borderRadius: '16px',
                                padding: '40px',
                                textAlign: 'center',
                                color: '#888',
                            }}>
                                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🤍</div>
                                <p style={{ fontSize: '16px', margin: 0 }}>Список избранного пуст</p>
                                <p style={{ fontSize: '14px', color: '#aaa', marginTop: '8px' }}>
                                    Нажимайте на сердечко на карточках питомцев чтобы добавить их сюда
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                                {favorites.map((fav) => (
                                    <div key={fav.pet_id} style={{
                                        background: '#FDF9EE',
                                        borderRadius: '16px',
                                        padding: '16px',
                                        width: '160px',
                                        textAlign: 'center',
                                        position: 'relative',
                                    }}>
                                        <button
                                            onClick={() => handleRemoveFavorite(fav.pet_id)}
                                            style={{
                                                position: 'absolute',
                                                top: '10px',
                                                right: '10px',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '18px',
                                                color: '#E74C3C',
                                                lineHeight: 1,
                                            }}
                                            title="Убрать из избранного"
                                        >
                                            ♥
                                        </button>
                                        {fav.photo_url && (
                                            <img src={fav.photo_url} alt={fav.pet_name}
                                                style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '10px', marginBottom: '10px' }} />
                                        )}
                                        <p style={{ margin: 0, fontWeight: '700', fontSize: '14px', color: '#1E2D24' }}>
                                            {fav.pet_name}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── ПРАВАЯ ЧАСТЬ: Мой профиль (Форма редактирования) ── */}
                    <div style={{
                        width: '300px',
                        flexShrink: 0,
                        background: '#F2F2F0',
                        borderRadius: '20px',
                        padding: '28px 24px',
                    }}>
                        <h3 style={{
                            fontSize: '18px',
                            fontWeight: '700',
                            color: '#1E2D24',
                            marginTop: 0,
                            marginBottom: '24px',
                            textAlign: 'center',
                        }}>
                            Мой профиль
                        </h3>

                        {profileLoading ? (
                            <p style={{ color: '#888', textAlign: 'center' }}>Загрузка...</p>
                        ) : (
                            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#555', display: 'block', marginBottom: '5px' }}>
                                        Email
                                    </label>
                                    <input
                                        type="text"
                                        value={user.email || ''}
                                        disabled
                                        style={{ ...inputStyle, color: '#888', backgroundColor: '#EFEFEF', cursor: 'not-allowed' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#555', display: 'block', marginBottom: '5px' }}>
                                        Имя
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Введите имя и фамилию"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        style={inputStyle}
                                    />
                                </div>

                                <div>
                                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#555', display: 'block', marginBottom: '5px' }}>
                                        Номер телефона
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="+7 (___) ___-__-__"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        style={inputStyle}
                                    />
                                    <p style={{ fontSize: '12px', color: '#999', margin: '5px 0 0' }}>
                                        Нужен для связи при подаче заявки
                                    </p>
                                </div>

                                {saveError && (
                                    <p style={{ color: '#C0392B', fontSize: '13px', margin: 0 }}>{saveError}</p>
                                )}

                                {saveSuccess && (
                                    <p style={{ color: '#365E42', fontSize: '13px', margin: 0, fontWeight: '600' }}>
                                        ✓ Данные сохранены
                                    </p>
                                )}

                                <button type="submit" disabled={saveLoading} style={{
                                    background: saveLoading ? '#8BA393' : '#365E42',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    fontSize: '15px',
                                    fontWeight: '700',
                                    cursor: saveLoading ? 'not-allowed' : 'pointer',
                                    transition: 'background 0.2s',
                                }}>
                                    {saveLoading ? 'Сохранение...' : 'Сохранить'}
                                </button>

                                <div style={{ borderTop: '1px solid #D8D8D8', margin: '4px 0' }} />

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    style={{
                                        background: 'transparent',
                                        color: '#C0392B',
                                        border: '1.5px solid #C0392B',
                                        padding: '11px',
                                        borderRadius: '8px',
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    Выйти из аккаунта
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}