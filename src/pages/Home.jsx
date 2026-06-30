// src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaTelegramPlane, FaVk } from 'react-icons/fa';
import api from '../api/axios'; 
import dogImg from '../assets/hero-dog.png'; 
import footerDog from '../assets/footer-dog.png'; 
import catGif from '../assets/cat-2.gif';
import PetsCarousel from '../components/PetsCarousel';

export default function Home() {
    const { user } = useAuth(); // Получаем данные об авторизованном пользователе
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        topic: '', 
        message: ''
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // ЭФФЕКТ ДЛЯ АВТОЗАПОЛНЕНИЯ ДАННЫХ
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (user) {
            // Email у нас обычно доступен сразу из контекста авторизации
            setFormData(prev => ({
                ...prev,
                email: user.email || ''
            }));

            // Имя и телефон надежнее стянуть из профиля на бэкенде
            const fetchProfileForForm = async () => {
                try {
                    const res = await api.get('/api/profile');
                    setFormData(prev => ({
                        ...prev,
                        name: res.data.full_name || prev.name,
                        phone: res.data.phone || prev.phone
                    }));
                } catch (err) {
                    console.error('Не удалось предзагрузить данные профиля для формы:', err);
                }
            };

            fetchProfileForForm();
        } else {
            // Если пользователь вышел из аккаунта, очищаем поля
            setFormData({
                name: '',
                email: '',
                phone: '',
                topic: '',
                message: ''
            });
        }
    }, [user]);

    const scrollToQuestions = () => {
        const element = document.getElementById('questions-form');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            await api.post('/api/feedback', {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                topic: formData.topic,
                message: formData.message
            });

            setSuccess(true);
            
            // После успешной отправки очищаем только тему и сообщение, 
            // а данные пользователя оставляем, чтобы ему не нужно было вводить их заново
            setFormData(prev => ({
                ...prev,
                topic: '',
                message: ''
            }));
        } catch (err) {
            console.error('Ошибка при отправке фидбека:', err);
            setError(err.response?.data?.error || 'Не удалось отправить сообщение. Попробуйте позже.');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        background: 'transparent',
        border: 'none',
        borderBottom: '1px solid #FFFFFF',
        padding: '12px 0',
        color: '#FFFFFF',
        fontSize: '16px',
        outline: 'none',
        fontFamily: 'inherit'
    };

    return (
        <div style={{ fontFamily: 'sans-serif', backgroundColor: '#F8FAF7', minHeight: '100vh', position: 'relative' }}>
            
            {/* ГЛАВНЫЙ БАННЕР */}
            <section style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 5%',           
                maxWidth: '1200px',        
                margin: '0 auto',          
                gap: '40px',               
                minHeight: '500px'         
            }}>
                <div style={{ flex: '1', maxWidth: '480px', zIndex: 2, textAlign: 'left' }}>
                    <h1 style={{ fontSize: '48px', fontWeight: '550', lineHeight: '1.15', color: '#000000', marginBottom: '20px', letterSpacing: '-0.5px' }}>
                        Один Друг — <br /> Тысячи <br /> Счастливых Дней
                    </h1>
                    <p style={{ fontSize: '15px', lineHeight: '1.5', color: '#333333', marginBottom: '30px', maxWidth: '420px' }}>
                        Питомец дарит вам не только улыбку, но и верного друга, который всегда разделит с вами каждый момент. У нас <b>100+</b> животных на любой характер и образ жизни.
                    </p>
                    <Link to="/pets" style={{ display: 'inline-block', background: '#365E42', color: '#FFFFFF', padding: '14px 30px', borderRadius: '8px', textDecoration: 'none', fontWeight: '700', fontSize: '15px' }}>
                        Посмотреть питомцев
                    </Link>
                </div>

                <div style={{ flex: '1', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '-20px', zIndex: 1 }}>
                    <img src={dogImg} alt="Добрый городок — Главная" style={{ width: '100%', maxWidth: '540px', height: 'auto', objectFit: 'contain' }} />
                </div>
            </section>

            {/* СЕКЦИЯ: ПИТОМЦЫ ПРИЮТА */}
            <PetsCarousel />

            {/* СЕКЦИЯ: ФОРМА ОБРАТНОЙ СВЯЗИ */}
            <section id="questions-form" style={{ 
                width: '100%', 
                display: 'flex', 
                backgroundColor: '#365E42', 
                position: 'relative',
                overflow: 'visible' 
            }}>
                <div style={{ 
                    flex: '1', 
                    padding: '60px 5% 80px 10%', 
                    maxWidth: '75%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    boxSizing: 'border-box'
                }}>
                    <h2 style={{ color: '#FFFFFF', fontSize: '32px', fontWeight: '700', marginBottom: '8px', marginTop: 0 }}>Есть вопросы?</h2>
                    <h2 style={{ color: '#FFFFFF', fontSize: '32px', fontWeight: '700', marginBottom: '40px', marginTop: 0 }}>Задавайте!</h2>

                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px 40px' }}>
                        <div>
                            <input type="text" name="name" placeholder="Введите имя" value={formData.name} onChange={handleInputChange} style={inputStyle} required />
                        </div>
                        <div>
                            <input type="email" name="email" placeholder="Введите E-mail" value={formData.email} onChange={handleInputChange} style={inputStyle} required />
                        </div>
                        <div>
                            <input type="tel" name="phone" placeholder="Введите телефон" value={formData.phone} onChange={handleInputChange} style={inputStyle} />
                        </div>
                        <div style={{ position: 'relative' }}>
                            <select 
                                name="topic" 
                                value={formData.topic} 
                                onChange={handleInputChange} 
                                style={{ 
                                    ...inputStyle, 
                                    appearance: 'none', 
                                    WebkitAppearance: 'none', 
                                    background: 'transparent',
                                    color: '#FFFFFF' 
                                }} 
                                required
                            >
                                <option value="" disabled hidden>Тема вопроса</option>
                                <option value="Общие вопросы" style={{color: '#000'}}>Общие вопросы</option>
                                <option value="Хочу взять питомца" style={{color: '#000'}}>Хочу взять питомца</option>
                                <option value="Стать волонтером" style={{color: '#000'}}>Стать волонтером</option>
                                <option value="Помощь приюту" style={{color: '#000'}}>Помощь приюту</option>
                            </select>
                            <span style={{ position: 'absolute', right: '5px', top: '15px', color: '#FFFFFF', pointerEvents: 'none', fontSize: '12px' }}>▼</span>
                        </div>
                        <div style={{ gridColumn: '1 / span 2', position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <input type="text" name="message" placeholder="Введите сообщение" value={formData.message} onChange={handleInputChange} style={inputStyle} required />
                            
                            <button type="submit" disabled={loading} style={{
                                position: 'absolute',
                                right: '0',
                                bottom: '5px',
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                backgroundColor: loading ? '#CCCCCC' : '#F4C430',
                                border: 'none',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                                transition: 'background-color 0.2s'
                            }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="#365E42" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        </div>
                    </form>

                    {success && (
                        <div style={{ color: '#F4C430', marginTop: '20px', fontWeight: '600', fontSize: '16px' }}>
                            ✓ Сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.
                        </div>
                    )}
                    {error && (
                        <div style={{ color: '#FF8888', marginTop: '20px', fontWeight: '600', fontSize: '16px' }}>
                            ✕ {error}
                        </div>
                    )}
                </div>

                <div style={{ 
                    flex: '0.3', 
                    backgroundImage: `url(${footerDog})`, 
                    backgroundSize: 'cover', 
                    backgroundPosition: 'right bottom',
                    height: 500
                }} />

                
            </section>
            <img 
                src={catGif} 
                alt="Машущий котик" 
                style={{ 
                    position: 'absolute',
                    bottom: '-90px',
                    left: '25%', 
                    transform: 'translateX(-50%)',
                    height: '180px',  
                    width: 'auto',
                    zIndex: 10
                }} 
            />

            {/* ПЛАВАЮЩАЯ КНОПКА */}
            <button 
                onClick={scrollToQuestions}
                style={{
                    position: 'fixed',
                    bottom: '40px',
                    right: '5%',           
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #365E42', 
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 999,
                    transition: 'transform 0.2s ease'
                }}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.2 L4 17.2V4H20V16Z" fill="#365E42"/>
                </svg>
            </button>
        </div>
    );
}