// src/pages/Help.jsx
import { useState, useEffect } from 'react';
import { FaHeart, FaHandsHelping, FaBone, FaTimes } from 'react-icons/fa';
// ДОБАВИЛИ: Импорт баннера из ассетов
import aboutBanner from '../assets/about.png'; 

export default function Help() {
    // Состояние для управления открытым модальным окном
    const [activeModal, setActiveModal] = useState(null);
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);
    // Данные карточек помощи приюту
    const helpCards = [
        {
            id: 'finance',
            icon: <FaHeart style={{ color: '#E74C3C', fontSize: '28px' }} />,
            title: 'Финансовая поддержка',
            description: 'Пожертвования на покупку медикаментов, оплату лечения в ветклиниках и закупку корма.',
            modalTitle: 'Финансовая помощь приюту',
            modalContent: (
                <div>
                    <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                        Все полученные средства идут на содержание приюта для животных. Мы будем благодарны вашим разовым пожертвованиям и ежемесячной помощи.
                    </p>
                    <div style={{ background: '#F4F7F5', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#365E42' }}>Реквизиты для перевода:</h4>
                        <p style={{ margin: '5px 0' }}><strong>Банк:</strong> Сбербанк</p>
                        <p style={{ margin: '5px 0' }}><strong>Номер телефона:</strong> +7 (921) 881-72-42</p>
                        <p style={{ margin: '5px 0' }}><strong>Получатель:</strong> Наталья Евгеньевна С.</p>
                    </div>
                </div>
            )
        },
        {
            id: 'volunteer',
            icon: <FaHandsHelping style={{ color: '#365E42', fontSize: '28px' }} />,
            title: 'Стать волонтером / опекуном',
            description: 'Приходите погулять с собаками, отвезите животное в клинику, возьмите опеку над питомцем приюта',
            modalTitle: 'Памятка: Волонтерство и Опекунство',
            modalContent: (
                <div>
                    <h4 style={{ margin: '0 0 10px 0', color: '#365E42', fontSize: '16px' }}>1. Кто может стать волонтером?</h4>
                    <p style={{ marginBottom: '15px', lineHeight: '1.6', color: '#444' }}>
                        Любой совершеннолетний гражданин, любящий животных и готовый уделять им немного своего личного времени. Подростки до 16 лет допускаются к прогулкам строго в сопровождении взрослых.
                    </p>

                    <h4 style={{ margin: '0 0 10px 0', color: '#365E42', fontSize: '16px' }}>2. Чем вы можете помочь на месте?</h4>
                    <ul style={{ paddingLeft: '20px', marginBottom: '15px', lineHeight: '1.6', color: '#444' }}>
                        <li>Выгул собак на прилегающей территории (социализация);</li>
                        <li>Вычесывание шерсти, базовый гигиенический уход;</li>
                        <li>Помощь в уборке вольеров и мелком ремонте территории;</li>
                        <li>Фотосъемка животных для создания красивых анкет на сайте.</li>
                    </ul>

                    <h4 style={{ margin: '0 0 10px 0', color: '#365E42', fontSize: '16px' }}>3. Программа «Опекунство»</h4>
                    <p style={{ marginBottom: '15px', lineHeight: '1.6', color: '#444' }}>
                        Если вы не можете забрать хвостика домой, вы можете стать его финансовым или личным опекуном: навещать его, покупать любимые лакомства и обеспечивать его содержание.
                    </p>

                    <div style={{ background: '#FFFDF3', border: '1px solid #F4C430', padding: '12px', borderRadius: '8px', fontSize: '14px', color: '#555' }}>
                        <strong>Как записаться на первый визит?</strong> Позвоните нам или заполните форму обратной связи на главной странице с темой «Волонтерство». Мы ждем вас!
                    </div>
                </div>
            )
        },
        {
            id: 'supplies',
            icon: <FaBone style={{ color: '#F4C430', fontSize: '28px' }} />,
            title: 'Подарить вещи и корма',
            description: 'Приюту всегда требуются сухие и влажные корма, пеленки, игрушки, поводки и чистящие средства.',
            modalTitle: 'Что приюту нужно всегда',
            modalContent: (
                <div>
                    <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                        Вы можете привезти вещи самостоятельно в часы посещения или заказать доставку через маркетплейсы (Ozon/WB) на ближайший к нам пункт выдачи.
                    </p>
                    <h4 style={{ margin: '0 0 10px 0', color: '#365E42' }}>Актуальный список нужд:</h4>
                    <ul style={{ paddingLeft: '20px', lineHeight: '1.6', color: '#444' }}>
                        <li>Корма для собак и кошек;</li>
                        <li>Препараты для ЖКТ;</li>
                        <li>Одноразовые впитывающие пеленки 60х60 или 60х90;</li>
                        <li>Поводки-рулетки, прочные ошейники, шлейки;</li>
                        <li>Средства для мытья полов и дезинфекции вольеров.</li>
                    </ul>
                </div>
            )
        }
    ];

    return (
        <div style={{ 
            fontFamily: 'sans-serif', 
            backgroundColor: '#F8FAF7', 
            minHeight: 'calc(100vh - 80px)', 
            paddingBottom: '80px'
        }}>
            
            <div style={{ 
                width: '100%', 
                height: '400px',          
                overflow: 'hidden',       
                position: 'relative',
                backgroundColor: '#F5F5F5' 
            }}>
                <img 
                    src={aboutBanner} 
                    alt="Как помочь приюту" 
                    style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',     
                        objectPosition: 'center', 
                        display: 'block'
                    }} 
                />
            </div>

            <div style={{ padding: '25px 5%' }}>
                
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#000000', marginBottom: '15px' }}>
                        Как помочь нашему приюту
                    </h1>
                    <p style={{ fontSize: '16px', color: '#333333', maxWidth: '600px', margin: '0 auto', lineHeight: '1.95' }}>
                        Каждое ваше действие, будь то финансовый перевод, пачка корма или пара часов прогулки, делает жизнь наших подопечных счастливее.
                    </p>
                </div>

                {/* СЕТКА С КАРТОЧКАМИ */}
                <div style={{ 
                    maxWidth: '1100px', 
                    margin: '0 auto', 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                    gap: '30px',
                    marginTop: '50px' // Немного уменьшил со 190px, так как сверху теперь есть визуальный вес от баннера
                }}>
                    {helpCards.map((card) => (
                        <div 
                            key={card.id} 
                            style={{ 
                                backgroundColor: '#FFFFFF', 
                                borderRadius: '12px', 
                                padding: '30px', 
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)', 
                                display: 'flex', 
                                flexDirection: 'column', 
                                justifyContent: 'space-between', // Исправил опечатку 'between' -> 'space-between'
                                border: '1px solid #EEF2ED'
                            }}
                        >
                            <div>
                                {/* Контейнер для иконки */}
                                <div style={{ 
                                    width: '60px', 
                                    height: '60px', 
                                    borderRadius: '50%', 
                                    backgroundColor: '#F4F7F5', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    marginBottom: '20px' 
                                }}>
                                    {card.icon}
                                </div>

                                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1E2D24', marginBottom: '12px' }}>
                                    {card.title}
                                </h3>
                                
                                <p style={{ fontSize: '14px', color: '#666666', lineHeight: '1.6', marginBottom: '25px' }}>
                                    {card.description}
                                </p>
                            </div>

                            <button 
                                onClick={() => setActiveModal(card)}
                                style={{ 
                                    marginTop: 'auto',
                                    background: 'transparent', 
                                    border: '2px solid #365E42', 
                                    color: '#365E42', 
                                    padding: '10px 20px', 
                                    borderRadius: '8px', 
                                    fontWeight: '700', 
                                    fontSize: '14px', 
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    width: '100%'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#365E42';
                                    e.currentTarget.style.color = '#FFFFFF';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = '#365E42';
                                }}
                            >
                                Подробнее
                            </button>
                        </div>
                    ))}
                </div>

            </div> {/* Конец внутренней обертки */}

            {/* МОДАЛЬНОЕ ОКНО (ВСПЛЫВАЮЩАЯ ПАМЯТКА) */}
            {activeModal && (
                <div style={{ 
                    position: 'fixed', 
                    top: 0, 
                    left: 0, 
                    width: '100%', 
                    height: '100%', 
                    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    zIndex: 2000,
                    padding: '20px'
                }}
                onClick={() => setActiveModal(null)} // Закрытие при клике на оверлей
                >
                    <div style={{ 
                        backgroundColor: '#FFFFFF', 
                        borderRadius: '16px', 
                        width: '100%', 
                        maxWidth: '550px', 
                        padding: '30px', 
                        position: 'relative',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                        animation: 'fadeIn 0.2s ease'
                    }}
                    onClick={(e) => e.stopPropagation()} // Предотвращаем закрытие при клике внутри окна
                    >
                        {/* Кнопка закрытия (Крестик) */}
                        <button 
                            onClick={() => setActiveModal(null)}
                            style={{ 
                                position: 'absolute', 
                                top: '20px', 
                                right: '20px', 
                                background: 'none', 
                                border: 'none', 
                                fontSize: '20px', 
                                color: '#999', 
                                cursor: 'pointer' 
                            }}
                        >
                            <FaTimes />
                        </button>

                        {/* Заголовок памятки */}
                        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1E2D24', marginBottom: '20px', paddingRight: '30px' }}>
                            {activeModal.modalTitle}
                        </h2>

                        {/* Динамический контент памятки из массива данных */}
                        <div style={{ fontSize: '15px', color: '#333333' }}>
                            {activeModal.modalContent}
                        </div>

                        {/* Кнопка закрытия внизу */}
                        <button 
                            onClick={() => setActiveModal(null)}
                            style={{ 
                                marginTop: '25px', 
                                width: '100%', 
                                background: '#365E42', 
                                color: '#FFFFFF', 
                                border: 'none', 
                                padding: '12px', 
                                borderRadius: '8px', 
                                fontSize: '15px', 
                                fontWeight: '700', 
                                cursor: 'pointer' 
                            }}
                        >
                            Понятно
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}