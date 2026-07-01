// src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { FaHeart, FaRegHeart, FaPaw, FaCheck } from 'react-icons/fa';

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

    // Список избранных питомцев
    const [favorites, setFavorites] = useState([]);
    const [dataLoading, setDataLoading] = useState(false);

    // Если не авторизован — редирект на главную
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (!user) navigate('/');
    }, [user, navigate]);

    // Загружаем профиль при входе
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

    // Умная загрузка избранного с объединением данных на фронтенде
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (!user) return;
        const fetchFavoritesData = async () => {
            setDataLoading(true);
            try {
                const favRes = await api.get('/api/favorites');
                const petsRes = await api.get('/api/pets');
                
                const favIdsArray = favRes.data; 
                const allPetsArray = petsRes.data;

                const fullFavoritePets = allPetsArray.filter(pet => {
                    return favIdsArray.some(fav => {
                        if (typeof fav === 'string') return fav === pet.id;
                        return fav.pet_id === pet.id;
                    });
                });

                setFavorites(fullFavoritePets);
            } catch (err) {
                console.error('Ошибка загрузки данных избранного:', err);
            } finally {
                setDataLoading(false);
            }
        };
        fetchFavoritesData();
    }, [user]);

    const handlePhoneChange = (e) => {
        // Разрешаем вводить только цифры, +, скобки, пробелы и тире
        const newPhone = e.target.value.replace(/[^\d+()\-\s]/g, '');
        setPhone(newPhone);
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaveError('');
        setSaveSuccess(false);

        // 1. Проверка имени (не пустое)
        if (!fullName.trim()) {
            setSaveError('Имя не может быть пустым');
            return;
        }

        // 2. Проверка номера телефона
        // Регулярное выражение для проверки российских номеров
        // Принимает форматы: +7 (999) 123-45-67, 89991234567, 8-999-123-45-67 и т.д.
        const phoneRegex = /^(\+7|8|7)?[\s\-]?\(?[0-9]{3}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
        
        if (!phone.trim() || !phoneRegex.test(phone.trim())) {
            setSaveError('Введите корректный номер телефона (например: +7 999 123-45-67)');
            return;
        }

        setSaveLoading(true);
        try {
            await api.put('/api/profile', { full_name: fullName.trim(), phone: phone.trim() });
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
            setFavorites(prev => prev.filter(pet => pet.id !== petId));
        } catch (err) {
            console.error('Ошибка удаления из избранного:', err);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

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
        <div style={{ backgroundColor: '#F8FAF7', minHeight: '100vh', fontFamily: 'sans-serif' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 5%' }}>

                <h1 style={{
                    fontSize: '32px',
                    fontWeight: '700',
                    color: '#1E2D24',
                    marginBottom: '32px',
                }}>
                    Личный кабинет
                </h1>

                <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>

                    {/* ── ЛЕВАЯ ЧАСТЬ: Избранное ── */}
                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#365E42', margin: '0 0 24px 0' }}>
                            Хочу познакомиться
                        </h2>

                        {dataLoading ? (
                            <p style={{ color: '#888' }}>Загрузка...</p>
                        ) : favorites.length === 0 ? (
                            <div style={{
                                background: '#FFFFFF',
                                borderRadius: '16px',
                                padding: '40px',
                                textAlign: 'center',
                                color: '#888',
                            }}>
                                <div style={{ fontSize: '48px', marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
                                    <FaRegHeart style={{ color: '#D8D8D8' }} />
                                </div>
                                <p style={{ fontSize: '16px', margin: 0 }}>Список избранного пуст</p>
                                <p style={{ fontSize: '14px', color: '#aaa', marginTop: '8px' }}>
                                    Нажимайте на сердечко на карточках питомцев, чтобы добавить их сюда
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                                {favorites.map((pet) => {
                                    const petId = pet.id;
                                    const petName = pet.name || 'Питомец';
                                    
                                    // ── Обновленная логика получения картинки через прокси ──
                                    const petImages = Array.isArray(pet.images) && pet.images.length > 0 
                                      ? pet.images 
                                      : (pet.image_url || pet.photo_url ? [pet.image_url || pet.photo_url] : []);
                                    const imageSrc = petImages[0];
                                    
                                    const proxiedImageSrc = imageSrc ? `https://wsrv.nl/?url=${encodeURIComponent(imageSrc)}` : null;
                                    // ─────────────────────────────────────────────────────────

                                    return (
                                        <div 
                                            key={petId} 
                                            onClick={() => navigate(`/pets/${petId}`)}
                                            style={{
                                                background: '#FDF9EE',
                                                borderRadius: '16px',
                                                padding: '16px',
                                                width: '160px',
                                                textAlign: 'center',
                                                position: 'relative',
                                                cursor: 'pointer',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                                transition: 'transform 0.2s, box-shadow 0.2s',
                                            }}
                                        >
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveFavorite(petId);
                                                }}
                                                style={{
                                                    position: 'absolute',
                                                    top: '12px',
                                                    right: '12px',
                                                    background: '#FFFFFF',
                                                    border: 'none',
                                                    borderRadius: '50%',
                                                    width: '28px',
                                                    height: '28px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    color: '#E74C3C',
                                                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                                                    zIndex: 2,
                                                    padding: 0,
                                                    margin: 0,
                                                }}
                                                title="Убрать из избранного"
                                            >
                                                <FaHeart style={{ fontSize: '14px' }} />
                                            </button>
                                            
                                            {proxiedImageSrc ? (
                                                <img 
                                                    src={proxiedImageSrc} 
                                                    alt={petName}
                                                    style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '10px', marginBottom: '10px' }} 
                                                />
                                            ) : (
                                                <div style={{
                                                    width: '100%',
                                                    height: '120px',
                                                    background: '#E8F0E8',
                                                    borderRadius: '10px',
                                                    marginBottom: '10px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#365E42'
                                                }}>
                                                    <FaPaw style={{ fontSize: '40px' }} />
                                                </div>
                                            )}
                                            
                                            <p style={{ margin: 0, fontWeight: '700', fontSize: '14px', color: '#1E2D24' }}>
                                                {petName}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* ── ПРАВАЯ ЧАСТЬ: Мой профиль ── */}
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
                                        onChange={handlePhoneChange}
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
                                    <p style={{ color: '#365E42', fontSize: '13px', margin: 0, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <FaCheck /> Данные сохранены
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