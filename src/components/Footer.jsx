import { FaTelegramPlane, FaVk } from 'react-icons/fa';
import catGif from '../assets/cat-2.gif';
export default function Footer() {
    return (
        <footer style={{ 
            backgroundColor: '#8BA393', 
            color: '#000000', 
            padding: '30px 5%',
            fontSize: '14px',
            position: 'relative', // Важно: чтобы абсолютный кот позиционировался от футера
            zIndex: 1
        }}>
                <div style={{ 
                    maxWidth: '1200px', 
                    margin: '0 auto', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '20px'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontWeight: '500' }}>    
                        <span>📞 +7 (951) 642-97-18</span>            
                        <span>✉️ info@gmail.com</span>
                        
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <span style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Мы в социальных сетях</span>
                        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                            <a href="https://t.me/dobryigorodok" target="_blank" rel="noopener noreferrer" style={{ color: '#000', fontSize: '24px' }}>
                                <FaTelegramPlane />
                            </a>
                            <a href="https://vk.com/dobriy_gorodok" target="_blank" rel="noopener noreferrer" style={{ color: '#000', fontSize: '24px' }}>
                                <FaVk />
                            </a>
                        </div>
                    </div>

                    <div style={{ fontWeight: '500' }}>
                        📍 Россия, Санкт-Петербург
                    </div>
                </div>
                
                <div style={{ marginTop: '30px', fontSize: '16px', textAlign: 'center', color: '#111' }}>
                    © 2026 Приют «Добрый городок». Все права защищены.
                </div>
                
            <img 
                src={catGif} 
                alt="Машущий котик" 
                style={{ 
                    position: 'absolute',
                    top: '-99px', // Меняем bottom на top, чтобы он вылезал НАВЕРХ из футера
                    left: '65%', 
                    transform: 'translateX(-53%)',
                    height: '200px',  
                    width: 'auto',
                    zIndex: 10
                }} 
            />
        </footer>
    );
}