// src/pages/PetCard.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { supabase } from '../api/supabaseClient';
import { 
  FaEdit, 
  FaPaw, 
  FaDog, 
  FaCat, 
  FaTrashAlt, 
  FaTimes,
  FaHeart,
  FaRegHeart,
  FaMars,
  FaVenus,
  FaChevronLeft,
  FaChevronRight,
  FaLock,
  FaClipboardList,
  FaExclamationTriangle
} from 'react-icons/fa';

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

export default function PetCard() {
  const { id } = useParams();
  const { user, addNotification } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  // Стейт для модальных окон ('edit', 'delete', 'notAuth', 'notAuthFav', 'noProfile', 'confirm' или null)
  const [modal, setModal] = useState(null); 
  
  // Стейты для редактирования
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('dog');
  const [editAge, setEditAge] = useState('');
  const [editGender, setEditGender] = useState('male');
  const [editDescription, setEditDescription] = useState('');
  const [editExistingImages, setEditExistingImages] = useState([]);
  const [editFiles, setEditFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const loadPetData = async () => {
    try {
      setLoading(true);
      const petRes = await api.get(`/api/pets/${id}`);
      const petData = petRes.data;
      setPet(petData);
      
      // Инициализация полей редактирования
      setEditName(petData.name || '');
      setEditType(petData.type || 'dog');
      setEditAge(petData.age || '');
      setEditGender(petData.gender || 'male');
      setEditDescription(petData.description || '');
      
      const images = Array.isArray(petData.images) ? petData.images : (petData.image_url || petData.photo_url ? [petData.image_url || petData.photo_url] : []);
      setEditExistingImages(images);
      setActiveImageIndex(0);

      if (user) {
        // 1. Проверяем статус заявки
        try {
          const appCheck = await api.get(`/api/applications/check/${id}`);
          setHasApplied(appCheck.data.applied);
        } catch (e) {
          console.error("Ошибка проверки заявки:", e);
        }

        // 2. Проверяем избранное
        try {
          const favRes = await api.get('/api/favorites');
          const isFav = favRes.data.some(fav => String(fav.pet_id ? fav.pet_id : fav) === String(id));
          setIsFavorite(isFav);
        } catch (e) {
          console.error("Ошибка загрузки избранного:", e);
        }
      } else {
        setHasApplied(false);
        setIsFavorite(false);
      }
    } catch (err) {
      console.error('Ошибка загрузки питомца:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    loadPetData();
  }, [id, user]);

  // Управление лайтбоксом с клавиатуры: ← → листают фото, Esc закрывает
  useEffect(() => {
    if (!lightboxOpen || !pet) return;

    const images = Array.isArray(pet.images) && pet.images.length > 0
      ? pet.images
      : (pet.image_url || pet.photo_url ? [pet.image_url || pet.photo_url] : []);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setLightboxOpen(false);
      } else if (e.key === 'ArrowLeft' && images.length > 1) {
        setActiveImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
      } else if (e.key === 'ArrowRight' && images.length > 1) {
        setActiveImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, pet]);

  // Логика кнопки "Забрать домой"
  const handleApply = async () => {
    if (!user) { setModal('notAuth'); return; }
    try {
      const res = await api.get('/api/profile');
      if (!res.data.full_name || !res.data.phone) { setModal('noProfile'); return; }
    } catch { setModal('notAuth'); return; }
    setModal('confirm');
  };

  const isProcessing = useRef(false);
  const handleSubmitApplication = async () => {
    if (isProcessing.current) return;
    isProcessing.current = true;
    setSubmitting(true);
    try {
      await api.post('/api/applications', { pet_id: pet.id });
      setHasApplied(true);
      if (addNotification) addNotification(`Заявка на знакомство с питомцем «${pet.name}» отправлена!`);
      else alert("Заявка успешно отправлена!");
      setModal(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Ошибка при отправке заявки');
    } finally {
      isProcessing.current = false;
      setSubmitting(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!user) {
      setModal('notAuthFav'); // Переключаем на специализированный стейт
      return;
    }
    const prevState = isFavorite;
    setIsFavorite(!isFavorite);
    try {
      if (prevState) {
        await api.delete(`/api/favorites/${id}`);
      } else {
        await api.post(`/api/favorites/${id}`);
      }
    } catch (err) {
      console.error('Ошибка обновления избранного:', err);
      setIsFavorite(prevState);
      alert("Не удалось обновить избранное");
    }
  };

  const handleDeletePet = async () => {
    try {
      await api.delete(`/api/pets/${id}`);
      setModal(null);
      navigate('/pets');
    } catch { 
      alert('Ошибка при удалении'); 
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let uploadedUrls = [];
      if (editFiles.length > 0) {
        for (const file of editFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
          const filePath = `animals/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('pet-photos')
            .upload(filePath, file);

          if (uploadError) throw new Error('Не удалось загрузить новые фото');

          const { data } = supabase.storage.from('pet-photos').getPublicUrl(filePath);
          uploadedUrls.push(data.publicUrl);
        }
      }

      const finalImages = [...editExistingImages, ...uploadedUrls];

      await api.put(`/api/pets/${id}`, {
        name: editName,
        type: editType,
        age: parseInt(editAge, 10),
        gender: editGender,
        description: editDescription,
        images: finalImages
      });

      alert('Данные питомца успешно обновлены!');
      setModal(null);
      setEditFiles([]);
      loadPetData();
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Ошибка сохранения данных');
    } finally {
      setSubmitting(false);
    }
  };

  const removeExistingImage = (urlToRemove) => {
    setEditExistingImages(prev => prev.filter(url => url !== urlToRemove));
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: '#F8FAF7', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#888', fontFamily: 'sans-serif' }}>Загрузка информации о питомце...</p>
      </div>
    );
  }

  if (!pet) {
    return (
      <div style={{ backgroundColor: '#F8FAF7', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', flexDirection: 'column', gap: '12px' }}>
        <FaPaw style={{ fontSize: '48px', color: '#365E42' }} />
        <p style={{ color: '#888', fontSize: '18px', margin: 0 }}>Питомец не найден.</p>
        <Link to="/pets" style={{ color: '#365E42', fontWeight: '600' }}>← Вернуться в каталог</Link>
      </div>
    );
  }

  const petImages = Array.isArray(pet.images) && pet.images.length > 0 
    ? pet.images 
    : (pet.image_url || pet.photo_url ? [pet.image_url || pet.photo_url] : []);

  const hasImages = petImages.length > 0;
  const currentRawSrc = hasImages ? petImages[activeImageIndex] : null;
  const proxiedMainSrc = currentRawSrc ? `https://wsrv.nl/?url=${encodeURIComponent(currentRawSrc)}` : null;

  return (
    <div style={{ backgroundColor: '#F8FAF7', minHeight: 'calc(100vh - 80px)', fontFamily: 'sans-serif', padding: '40px 5%' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Кнопка возврата */}
        <Link to="/pets" style={{ textDecoration: 'none', color: '#365E42', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <FaChevronLeft style={{ fontSize: '12px' }} /> Назад к каталогу
        </Link>

        <div style={{ display: 'flex', gap: '40px', background: '#FFF', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', position: 'relative' }}>
          
          {/* Кнопка «Избранное» */}
          <button
            onClick={handleFavoriteToggle}
            style={{
              position: 'absolute', top: '32px', right: '32px', background: '#F0F4F0', border: 'none', borderRadius: '50%',
              width: '44px', height: '44px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: isFavorite ? '#E63946' : '#1E2D24', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', transition: 'transform 0.2s', zIndex: 10
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            {isFavorite ? <FaHeart style={{ fontSize: '22px' }} /> : <FaRegHeart style={{ fontSize: '22px' }} />}
          </button>

          {/* ЛЕВАЯ ЧАСТЬ: Изображения */}
          <div style={{ width: '450px', flexShrink: 0 }}>
            <div style={{ width: '100%', height: '380px', borderRadius: '12px', overflow: 'hidden', background: '#E8F0E8', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              {proxiedMainSrc ? (
                <img
                  src={proxiedMainSrc}
                  alt={pet.name}
                  onClick={() => setLightboxOpen(true)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in' }}
                />
              ) : pet.type === 'dog' ? (
                <FaDog style={{ fontSize: '100px', color: '#365E42' }} />
              ) : (
                <FaCat style={{ fontSize: '100px', color: '#365E42' }} />
              )}

              {/* Стрелки навигации по галерее */}
              {petImages.length > 1 && (
                <>
                  <button 
                    onClick={() => setActiveImageIndex(prev => (prev === 0 ? petImages.length - 1 : prev - 1))}
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.75)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}
                  >
                    <FaChevronLeft style={{ fontSize: '12px', color: '#1E2D24' }} />
                  </button>
                  <button 
                    onClick={() => setActiveImageIndex(prev => (prev === petImages.length - 1 ? 0 : prev + 1))}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.75)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}
                  >
                    <FaChevronRight style={{ fontSize: '12px', color: '#1E2D24' }} />
                  </button>
                </>
              )}
            </div>

            {/* Миниатюры */}
            {petImages.length > 1 && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
                {petImages.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    style={{
                      width: '70px', height: '70px', borderRadius: '6px', overflow: 'hidden', cursor: 'pointer',
                      border: activeImageIndex === idx ? '2.5px solid #365E42' : '2.5px solid transparent',
                      boxSizing: 'border-box', background: '#E8F0E8', flexShrink: 0
                    }}
                  >
                    <img src={`https://wsrv.nl/?url=${encodeURIComponent(img)}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ПРАВАЯ ЧАСТЬ: Описание */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingRight: '40px' }}>
            <h1 style={{ fontSize: '32px', color: '#1E2D24', margin: '0 0 12px 0', fontWeight: '700' }}>{pet.name}</h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px', color: '#555', marginBottom: '20px' }}>
              {pet.gender === 'male' ? (
                <>
                  <FaMars style={{ color: '#4A90D9', fontSize: '16px' }} /> <span>Мальчик</span>
                </>
              ) : (
                <>
                  <FaVenus style={{ color: '#D9608A', fontSize: '16px' }} /> <span>Девочка</span>
                </>
              )}
              <span style={{ color: '#BBB' }}>•</span>
              <span>{ageLabel(pet.age)}</span>
            </div>

            <div style={{ borderTop: '1px solid #EFEFEF', borderBottom: '1px solid #EFEFEF', padding: '16px 0', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#1E2D24' }}>О питомце:</h3>
              <p style={{ margin: 0, color: '#444', lineHeight: '1.6', fontSize: '15px', whiteSpace: 'pre-line' }}>
                {pet.description || 'У этого питомца пока нет подробного описания, но вы можете узнать о нём подробнее у волонтёров приюта.'}
              </p>
            </div>

            {/* Кнопки связи / Действия админа */}
            <div style={{ marginTop: 'auto', display: 'flex', gap: '12px' }}>
              <button 
                onClick={handleApply} 
                disabled={submitting || hasApplied} 
                style={{ 
                  flex: 1, padding: '16px 24px', 
                  background: hasApplied ? '#95a5a6' : (submitting ? '#D4A010' : '#F4C430'),
                  color: '#fff', border: 'none', borderRadius: '30px', fontWeight: '700', fontSize: '16px', 
                  cursor: (submitting || hasApplied) ? 'not-allowed' : 'pointer', 
                  opacity: submitting ? 0.7 : 1, transition: 'all 0.2s ease', 
                  boxShadow: submitting ? 'none' : '0 4px 15px rgba(244, 196, 48, 0.3)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
                onMouseEnter={(e) => !submitting && !hasApplied && (e.target.style.transform = 'scale(1.02)')}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                <FaPaw /> 
                {hasApplied 
                  ? 'Заявка уже отправлена' 
                  : (submitting ? 'Отправка...' : 'Забрать домой')
                }
              </button>

              {isAdmin && (
                <>
                  <button onClick={() => setModal('edit')} style={{ background: '#FFF', color: '#365E42', border: '1.5px solid #365E42', padding: '12px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Редактировать">
                    <FaEdit style={{ fontSize: '18px' }} />
                  </button>
                  <button onClick={() => setModal('delete')} style={{ background: '#FFF', color: '#C0392B', border: '1.5px solid #C0392B', padding: '12px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Удалить карточку">
                    <FaTrashAlt style={{ fontSize: '18px' }} />
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ── ЛАЙТБОКС: увеличенное фото питомца ── */}
      {lightboxOpen && proxiedMainSrc && (
        <div
          onClick={() => setLightboxOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2000, padding: '24px', boxSizing: 'border-box'
          }}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            style={{
              position: 'absolute', top: '20px', right: '24px', background: 'rgba(255,255,255,0.15)',
              border: 'none', borderRadius: '50%', width: '44px', height: '44px', color: '#fff',
              fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            title="Закрыть"
          >
            <FaTimes />
          </button>

          <div onClick={e => e.stopPropagation()} style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <img
              src={proxiedMainSrc}
              alt={pet.name}
              style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px', display: 'block' }}
            />

            {/* Навигация по галерее прямо в лайтбоксе */}
            {petImages.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImageIndex(prev => (prev === 0 ? petImages.length - 1 : prev - 1))}
                  style={{ position: 'absolute', left: '-16px', top: '50%', transform: 'translate(-100%, -50%)', background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <FaChevronLeft style={{ fontSize: '14px', color: '#1E2D24' }} />
                </button>
                <button
                  onClick={() => setActiveImageIndex(prev => (prev === petImages.length - 1 ? 0 : prev + 1))}
                  style={{ position: 'absolute', right: '-16px', top: '50%', transform: 'translate(100%, -50%)', background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <FaChevronRight style={{ fontSize: '14px', color: '#1E2D24' }} />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── МОДАЛЬНЫЕ ОКНА СИСТЕМЫ ── */}
      {modal && (
        <div onClick={() => setModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#FDF9EE', borderRadius: '16px', padding: '36px', maxWidth: '440px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', textAlign: 'center', boxSizing: 'border-box' }}>

            {/* Окно неавторизованного пользователя для кнопки ЗАЯВКИ */}
            {modal === 'notAuth' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                  <FaLock style={{ fontSize: '40px', color: '#365E42' }} />
                </div>
                <h3 style={{ color: '#1E2D24', marginBottom: '10px', marginTop: 0 }}>Необходима авторизация</h3>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>Пожалуйста, войдите в систему, чтобы отправлять заявки.</p>
                <button onClick={() => setModal(null)} style={greenBtn}>Понятно</button>
              </>
            )}

            {/* Исправленное окно неавторизованного пользователя для ИЗБРАННОГО */}
            {modal === 'notAuthFav' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                  <FaLock style={{ fontSize: '40px', color: '#365E42' }} />
                </div>
                <h3 style={{ color: '#1E2D24', marginBottom: '10px', marginTop: 0 }}>Необходима авторизация</h3>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>Пожалуйста, войдите в систему, чтобы добавлять питомцев в избранное.</p>
                <button onClick={() => setModal(null)} style={greenBtn}>Понятно</button>
              </>
            )}
            
            {modal === 'noProfile' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                  <FaClipboardList style={{ fontSize: '40px', color: '#365E42' }} />
                </div>
                <h3 style={{ color: '#1E2D24', marginBottom: '10px', marginTop: 0 }}>Заполните профиль</h3>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>Укажите имя и номер телефона в профиле, чтобы волонтёры могли связаться с вами.</p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => setModal(null)} style={outlineBtn}>Отмена</button>
                  <button onClick={() => { setModal(null); navigate('/profile'); }} style={greenBtn}>В профиль</button>
                </div>
              </>
            )}
            
            {modal === 'confirm' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                  {pet.type === 'dog' ? (
                    <FaDog style={{ fontSize: '44px', color: '#365E42' }} />
                  ) : (
                    <FaCat style={{ fontSize: '44px', color: '#365E42' }} />
                  )}
                </div>
                <h3 style={{ color: '#1E2D24', marginBottom: '10px', marginTop: 0 }}>Отправить заявку?</h3>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>Мы отправим запрос на знакомство с питомцем «{pet.name}» администраторам.</p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => setModal(null)} style={outlineBtn}>Нет</button>
                  <button onClick={handleSubmitApplication} disabled={submitting} style={greenBtn}>
                    {submitting ? 'Отправка...' : 'Да, отправить'}
                  </button>
                </div>
              </>
            )}
            
            {modal === 'delete' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                  <FaExclamationTriangle style={{ fontSize: '40px', color: '#C0392B' }} />
                </div>
                <h3 style={{ color: '#C0392B', marginBottom: '10px', marginTop: 0 }}>Удалить питомца?</h3>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>Вы уверены, что хотите безвозвратно удалить карточку {pet.name}?</p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => setModal(null)} style={outlineBtn}>Отмена</button>
                  <button onClick={handleDeletePet} style={{ ...greenBtn, background: '#C0392B' }}>Удалить</button>
                </div>
              </>
            )}

            {/* ВСПЛЫВАЮЩЕЕ ОКНО РЕДАКТИРОВАНИЯ */}
            {modal === 'edit' && (
              <div style={{ maxHeight: '80vh', overflowY: 'auto', paddingRight: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ color: '#1E2D24', margin: 0 }}>Редактирование профиля</h3>
                  <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#888', display: 'flex', alignItems: 'center' }}>
                    <FaTimes />
                  </button>
                </div>

                <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
                  <input type="text" placeholder="Кличка" value={editName} onChange={e => setEditName(e.target.value)} required style={inputStyle} />
                  <select value={editType} onChange={e => setEditType(e.target.value)} style={inputStyle}>
                    <option value="dog">Собака</option>
                    <option value="cat">Кошка</option>
                  </select>
                  <input type="number" placeholder="Возраст в месяцах" value={editAge} onChange={e => setEditAge(e.target.value)} required style={inputStyle} />
                  <select value={editGender} onChange={e => setEditGender(e.target.value)} style={inputStyle}>
                    <option value="male">Мальчик</option>
                    <option value="female">Девочка</option>
                  </select>
                  <textarea placeholder="Описание..." value={editDescription} onChange={e => setEditDescription(e.target.value)} style={{ ...inputStyle, height: '80px', resize: 'none' }} />
                  
                  {/* УПРАВЛЕНИЕ СУЩЕСТВУЮЩИМИ ФОТО */}
                  <label style={{ fontSize: '13px', fontWeight: '700', color: '#365E42', margin: '4px 0 0' }}>Текущие фото:</label>
                  {editExistingImages.length === 0 ? (
                    <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>Нет загруженных фото</p>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', background: '#FFF', padding: '8px', borderRadius: '8px', border: '1.5px solid #D0D0D0' }}>
                      {editExistingImages.map((url, idx) => (
                        <div key={idx} style={{ position: 'relative', width: '55px', height: '55px', borderRadius: '4px', overflow: 'hidden' }}>
                          <img src={`https://wsrv.nl/?url=${encodeURIComponent(url)}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button 
                            type="button" 
                            onClick={() => removeExistingImage(url)}
                            style={{
                              position: 'absolute', top: '2px', right: '2px', background: 'rgba(192, 57, 43, 0.85)', color: '#fff',
                              border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px',
                              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                            title="Удалить это фото"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <label style={{ fontSize: '13px', fontWeight: '700', color: '#365E42', marginTop: '4px' }}>Добавить еще фото:</label>
                  <input type="file" accept="image/*" multiple onChange={e => setEditFiles(Array.from(e.target.files))} />

                  <div style={{ display: 'flex', gap: '12px', marginTop: '14px' }}>
                    <button type="button" onClick={() => setModal(null)} style={outlineBtn}>Отмена</button>
                    <button type="submit" disabled={submitting} style={greenBtn}>{submitting ? 'Сохранение...' : 'Сохранить'}</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle = { width: '100%', padding: '10px', border: '1.5px solid #D0D0D0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none' };
const greenBtn = { flex: 1, padding: '12px', background: '#365E42', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '15px', cursor: 'pointer' };
const outlineBtn = { flex: 1, padding: '12px', background: '#fff', color: '#365E42', border: '1.5px solid #365E42', borderRadius: '8px', fontWeight: '600', fontSize: '15px', cursor: 'pointer' };