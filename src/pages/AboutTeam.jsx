// src/pages/AboutTeam.jsx
// 1. Импортируем фотографии из папки src/assets
import nastyaPhoto from '../assets/nastyaPhoto.jpg';
import denisPhoto from '../assets/denisPhoto.jpg';
import kirillPhoto from '../assets/kirillPhoto.jpg';
import { useEffect} from 'react';

export default function AboutTeam() {
    const teamMembers = [
        {
            id: 1,
            name: 'Анастасия',
            role: 'Frontend Developer',
            description: 'Разработала интерактивный интерфейс на React: адаптивный каталог питомцев, плавные карусели на главной и динамические формы.',
            image: nastyaPhoto
        },
        {
            id: 2,
            name: 'Денис',
            role: 'Backend Developer',
            description: 'Спроектировал серверную архитектуру на Express и Node.js. Настроил базу данных PostgreSQL, интеграцию с Supabase и умную фильтрацию API.',
            image: denisPhoto
        },
        {
            id: 3,
            name: 'Кирилл',
            role: 'QA Engineer',
            description: 'Организовал рабочие спринты команды, контролирует стабильность бизнес-логики (авторизация, избранное) и проводит сквозное тестирование API.',
            image: kirillPhoto
        }
        
    ];
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    return (
        <main style={{ backgroundColor: '#F8FAF7', minHeight: 'calc(100vh - 80px)', padding: '30px 40px', boxSizing: 'border-box' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                
                {/* Заголовок страницы */}
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <h1 style={{ fontSize: '36px', fontWeight: '700', color: '#1E2D24', margin: '0 0 16px 0' }}>
                        О команде
                    </h1>
                    <p style={{ fontSize: '16px', color: '#000000', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
                        Мы — разработчики цифровой платформы приюта «Добрый городок».
                        Объединили технологии и любовь к животным, чтобы помочь каждому питомцу найти свой дом.
                    </p>
                    <div style={{ width: '60px', height: '3px', backgroundColor: '#365E42', margin: '20px auto 0', borderRadius: '2px' }} />
                </div>

                {/* Сетка карточек */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                    gap: '30px',
                    alignItems: 'stretch'
                }}>
                    {teamMembers.map(member => (
                        <div
                            key={member.id}
                            style={{
                                background: '#FFFFFF',
                                borderRadius: '16px',
                                border: '2px solid #E5E5E5',
                                padding: '36px 28px',
                                textAlign: 'center',
                                boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-6px)';
                                e.currentTarget.style.boxShadow = '0 12px 30px rgba(30, 45, 36, 0.1)';
                                e.currentTarget.style.borderColor = '#365E42';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'none';
                                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.02)';
                                e.currentTarget.style.borderColor = '#E5E5E5';
                            }}
                        >
                            {/* Круглый контейнер под фото — фиксированный размер, чтобы не искажался */}
                            <div style={{
                                width: '220px',
                                height: '220px',
                                borderRadius: '50%', // Полный круг: работает верно только при равных width/height
                                marginBottom: '20px',
                                border: '2px solid #365E42',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#F9F9F9',
                                flexShrink: 0
                            }}>
                                <img 
                                    src={member.image} 
                                    alt={member.name} 
                                    style={{ 
                                        width: '100%', 
                                        height: '100%', 
                                        objectFit: 'cover' // Фото будет аккуратно заполнять весь прямоугольник
                                    }} 
                                />
                            </div>

                            {/* Имя */}
                            <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#1E2D24', margin: '0 0 6px 0' }}>
                                {member.name}
                            </h3>
                            
                            {/* Роль / Бейдж */}
                            <span style={{
                                backgroundColor: '#365E42',
                                color: '#FFFFFF',
                                padding: '6px 16px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: '700',
                                marginBottom: '20px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                {member.role}
                            </span>

                            {/* Описание задач */}
                            <p style={{
                                fontSize: '14px',
                                color: '#666666',
                                lineHeight: '1.6',
                                margin: '0',
                                flex: 1
                            }}>
                                {member.description}
                            </p>

                        </div>
                    ))}
                </div>

            </div>
        </main>
    );
}