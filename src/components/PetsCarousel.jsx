// src/components/PetsCarousel.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { FaChevronLeft, FaChevronRight, FaHeart, FaRegHeart, FaDog, FaCat, FaLock } from 'react-icons/fa';

const VISIBLE_COUNT = 3;

// Вспомогательная функция для форматирования возраста
function ageLabel(totalMonths) {
  if (totalMonths <= 0) return 'совсем малыш';
  
  const getPlural = (num, one, two, many) => {
    let n = Math.abs(num);
    n %= 100;
    if (n >= 5 && n <= 20) return many;
    n %= 10;
    if (n === 1) return one;
    if (n >= 2 && n <= 4) return two;
    return many;
  };

  if (totalMonths < 12) {
    return `${totalMonths} ${getPlural(totalMonths, 'месяц', 'месяца', 'месяцев')}`;
  }

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  const yearsStr = `${years} ${getPlural(years, 'год', 'года', 'лет')}`;
  const monthsStr = months > 0 ? ` ${months} ${getPlural(months, 'месяц', 'месяца', 'месяцев')}` : '';

  return yearsStr + monthsStr;
}

export default function PetsCarousel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // all | dog | cat
  const [startIndex, setStartIndex] = useState(0);
  const [favorites, setFavorites] = useState([]);

  // Стейт для модального окна авторизации (Избранное)
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const petsRes = await api.get('/api/pets');
        setPets(petsRes.data);

        if (user) {
          const favRes = await api.get('/api/favorites');
          const favIds = favRes.data.map(f => String(f.pet_id ? f.pet_id : f));
          setFavorites(favIds);
        } else {
          setFavorites([]);
        }
      } catch (err) {
        console.error('Ошибка загрузки:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Функция для синхронизации избранного при клике в карточке
  const toggleFavoriteInParent = (petId) => {
    const idStr = String(petId);
    setFavorites(prev => 
      prev.includes(idStr) 
        ? prev.filter(id => id !== idStr) // Удаляем, если уже был
        : [...prev, idStr]               // Добавляем, если не было
    );
  };

  // Фильтрация
  const filtered = pets.filter(p => filterType === 'all' || p.type === filterType);

  // Сброс прокрутки карусели при смене фильтра
  useEffect(() => { setStartIndex(0); }, [filterType]);

  const visiblePets = filtered.slice(startIndex, startIndex + VISIBLE_COUNT);
  const canGoPrev = startIndex > 0;
  const canGoNext = startIndex + VISIBLE_COUNT < filtered.length;

  const goPrev = () => setStartIndex(i => Math.max(0, i - VISIBLE_COUNT));
  const goNext = () => setStartIndex(i => Math.min(filtered.length - VISIBLE_COUNT, i + VISIBLE_COUNT));

  const filterBtn = (val, label) => {
    const active = filterType === val;
    return (
      <button
        onClick={() => setFilterType(val)}
        style={{
          padding: '10px 35px',
          borderRadius: '20px',
          border: active ? 'none' : '1px solid #365E42',
          background: active ? '#F4C430' : 'transparent',
          color: active ? '#FFFFFF' : '#666666',
          fontWeight: active ? '700' : '500',
          fontSize: '15px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <>
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 5%', backgroundColor: '#F8FAF7' }}>

        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '25px', color: '#000000' }}>
          Питомцы приюта
        </h2>

        {/* Фильтр Все / Собаки / Кошки */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
          {filterBtn('all', 'Все')}
          {filterBtn('dog', 'Собаки')}
          {filterBtn('cat', 'Кошки')}
        </div>

        {loading ? (
          <p style={{ color: '#999' }}>Загрузка питомцев...</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: '#999', fontStyle: 'regular' }}>Питомцы скоро появятся здесь</p>
        ) : (
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>

            {/* Стрелка влево */}
            <ArrowButton direction="left" onClick={goPrev} disabled={!canGoPrev} />

            {/* Карточки */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${VISIBLE_COUNT}, 1fr)`,
              gap: '24px',
              flex: 1,
              margin: '0 24px',
            }}>
              {visiblePets.map(pet => (
                <CarouselCard 
                  key={pet.id} 
                  pet={pet} 
                  user={user} 
                  isFavoriteInit={favorites.includes(String(pet.id))} 
                  onToggleFavorite={toggleFavoriteInParent} 
                  onAuthRequired={() => setShowAuthModal(true)} // Передаем вызов модалки
                />
              ))}
            </div>

            {/* Стрелка вправо */}
            <ArrowButton direction="right" onClick={goNext} disabled={!canGoNext} />
          </div>
        )}

        {/* Кнопка "Показать всех" */}
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <button
            onClick={() => navigate('/pets')}
            style={{
              padding: '12px 40px',
              border: '0px solid #1E2D24',
              borderRadius: '8px',
              background: '#F4C430',
              color: '#FFFFFF',
              fontWeight: '700',
              fontSize: '15px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Показать всех
          </button>
        </div>
      </section>

      {/* ── МОДАЛЬНОЕ ОКНО АВТОРИЗАЦИИ ДЛЯ ИЗБРАННОГО ── */}
      {showAuthModal && (
        <div onClick={() => setShowAuthModal(false)} style={modalOverlayStyle}>
          <div onClick={e => e.stopPropagation()} style={modalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
              <FaLock style={{ fontSize: '40px', color: '#365E42' }} />
            </div>
            <h3 style={{ color: '#1E2D24', marginBottom: '10px', marginTop: 0 }}>Необходима авторизация</h3>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>Пожалуйста, войдите в систему, чтобы добавлять питомцев в избранное.</p>
            <button onClick={() => setShowAuthModal(false)} style={{ width: '100%', padding: '12px', background: '#365E42', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '15px', cursor: 'pointer' }}>Понятно</button>
          </div>
        </div>
      )}
    </>
  );
}

// ── Кнопка-стрелка навигации ──────────────────────────────────────────────────
function ArrowButton({ direction, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '44px', height: '44px',
        borderRadius: '50%',
        border: '1px solid #D0D0D0',
        background: '#FFFFFF',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.3 : 1,
        flexShrink: 0,
        transition: 'opacity 0.2s',
        fontSize: '18px',
        color: '#365E42',
      }}
    >
      {direction === 'left' ? <FaChevronLeft style={{ fontSize: '14px' }} /> : <FaChevronRight style={{ fontSize: '14px' }} />}
    </button>
  );
}

// ── Обновленная карточка питомца в карусели с обходом блокировки изображений ──
function CarouselCard({ pet, user, isFavoriteInit, onToggleFavorite, onAuthRequired }) {
  const [isFavorite, setIsFavorite] = useState(isFavoriteInit);

  useEffect(() => {
    setIsFavorite(isFavoriteInit);
  }, [isFavoriteInit]);

  const petImages = Array.isArray(pet.images) && pet.images.length > 0
    ? pet.images
    : (pet.image_url || pet.photo_url ? [pet.image_url || pet.photo_url] : []);
  const imageSrc = petImages[0];

  // Проксируем ссылку через weserv.nl для стабильной загрузки без VPN
  const proxiedImageSrc = imageSrc ? `https://wsrv.nl/?url=${encodeURIComponent(imageSrc)}` : null;

  const handleFavoriteClick = async (e) => {
    e.preventDefault(); 
    e.stopPropagation(); 

    if (!user) {
      onAuthRequired(); // Вызываем переданную функцию вместо alert
      return;
    }

    const previousState = isFavorite;
    setIsFavorite(!isFavorite);

    // Сразу меняем состояние в родителе для отзывчивости интерфейса
    if (onToggleFavorite) {
      onToggleFavorite(pet.id);
    }

    try {
      if (previousState) {
        await api.delete(`/api/favorites/${pet.id}`);
      } else {
        await api.post(`/api/favorites/${pet.id}`);
      }
    } catch (err) {
      console.error("Ошибка при обновлении избранного:", err);
      // Если запрос завершился ошибкой, откатываем состояние назад
      setIsFavorite(previousState);
      if (onToggleFavorite) {
        onToggleFavorite(pet.id);
      }
      alert("Не удалось обновить избранное, попробуйте позже");
    }
  };

  return (
    <Link to={`/pets/${pet.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div 
        style={{ 
          borderRadius: '12px', 
          overflow: 'hidden', 
          background: '#FAFAFA', 
          border: '1px solid #EFEFEF', 
          transition: 'box-shadow 0.2s, transform 0.2s', 
          cursor: 'pointer',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: '360px'
        }} 
        onMouseEnter={e => { 
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)'; 
          e.currentTarget.style.transform = 'translateY(-2px)'; 
        }} 
        onMouseLeave={e => { 
          e.currentTarget.style.boxShadow = 'none'; 
          e.currentTarget.style.transform = 'none'; 
        }}
      >
        {/* Кнопка Избранное (Сердечко) поверх изображения */}
        <button
          onClick={handleFavoriteClick}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(255, 255, 255, 0.85)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            cursor: 'pointer',
            fontSize: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isFavorite ? '#E63946' : '#1E2D24', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 2,
            transition: 'transform 0.1s ease, color 0.2s ease',
            lineHeight: 1
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {isFavorite ? <FaHeart style={{ fontSize: '18px' }} /> : <FaRegHeart style={{ fontSize: '18px' }} />}
        </button>

        <div style={{ width: '100%', height: '250px', background: '#E8F0E8', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
          {/* Используем проксированный URL вместо оригинального */}
          {proxiedImageSrc ? (
            <img src={proxiedImageSrc} alt={pet.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '60px', display: 'flex', color: '#365E42' }}>{pet.type === 'dog' ? <FaDog /> : <FaCat />}</span>
          )}
        </div>
        
        <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{ margin: '0 0 4px', fontWeight: '700', fontSize: '16px', color: '#1E2D24' }}>{pet.name}</p>
          <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>{pet.gender === 'male' ? '♂ мальчик' : '♀ девочка'} · {ageLabel(pet.age)}</p>
        </div>
      </div>
    </Link>
  );
}

// ── Стили модального окна ─────────────────────────────────────────────────────
const modalOverlayStyle = { 
  position: 'fixed', 
  inset: 0, 
  background: 'rgba(0,0,0,0.5)', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  zIndex: 1000 
};

const modalContentStyle = { 
  background: '#FDF9EE', 
  borderRadius: '16px', 
  padding: '32px', 
  maxWidth: '420px', 
  width: '90%', 
  boxSizing: 'border-box', 
  boxShadow: '0 20px 60px rgba(0,0,0,0.2)', 
  textAlign: 'center' 
};