// src/pages/About.jsx
import { Link } from 'react-router-dom';
import aboutBanner from '../assets/about.png'; 
import { useEffect } from 'react';
import DocumentsSection from '../components/DocumentsSection';
import aboutGif from '../assets/cat-3.gif';

export default function About() {
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);
    return (
        <div style={{ 
            fontFamily: 'sans-serif', 
            backgroundColor: '#F8FAF7', 
            minHeight: 'calc(100vh - 80px)', 
            paddingBottom: '80px' 
        }}>

            <div style={{ 
                width: '100%', 
                height: '400px',          // Строго фиксированная высота баннера
                overflow: 'hidden',       // Скрываем всё, что выходит за рамки 400px
                position: 'relative',
                backgroundColor: '#F5F5F5' 
            }}>
                <img 
                    src={aboutBanner} 
                    alt="О приюте — Волонтёры и питомцы" 
                    style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',     // Изображение масштабируется без искажения пропорций
                        objectPosition: 'center', // Фокус картинки всегда остается строго по центру
                        display: 'block'
                    }} 
                />
            </div>

            {/* ОСНОВНОЙ ТЕКСТОВЫЙ БЛОК */}
            <div style={{ 
                maxWidth: '900px', 
                margin: '0 auto', 
                padding: '0 5%', 
                textAlign: 'center',
                marginTop: '50px' 
            }}>
                
                <h1 style={{ 
                    fontSize: '32px', 
                    fontWeight: '700', 
                    color: '#000000', 
                    marginBottom: '25px'
                }}>
                    Волонтёрский мини-приют «Добрый городок»
                </h1>

                <p style={{ 
                    fontSize: '16px', 
                    lineHeight: '1.95', 
                    color: '#333333', 
                    marginBottom: '10px',
                    textAlign: 'center'
                }}>
                    Мы — команда волонтёров мини-приюта «Добрый городок» в Санкт-Петербурге. 
                    Мы спасаем бездомных кошек и собак, заботимся о них, дарим им заботу и активно 
                    ищем для каждого любящую семью. Сейчас в нашем приюте живут и ждут своего 
                    человека более 50 питомцев.
                </p>

                {/* БЛОК С КНОПКАМИ ДЕЙСТВИЯ */}
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    gap: '20px', 
                    flexWrap: 'wrap' 
                }}>
                     <DocumentsSection />       
                </div>

            </div>
        </div>
    );
}