// src/pages/PetCard.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { supabase } from '../api/supabaseClient';

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
  const [isFavorite, setIsFavorite] = useState(false);
  const [modal, setModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  // Стейт для активной фотографии в галерее карточки
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  
  // Стейт для полноэкранного увеличения фотографии
  const [isZoomed, setIsZoomed] = useState(false);

  // Стейты для редактирования
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('dog');
  const [editAge, setEditAge] = useState('');
  const [editGender, setEditGender] = useState('male');
  const [editDescription, setEditDescription] = useState('');
  const [existingImages, setExistingImages] = useState([]); // Оставшиеся старые фото
  const [editFiles, setEditFiles] = useState([]); // Новые добавляемые фото

  const loadPetData = async () => {
    try {
      const petRes = await api.get(`/api/pets/${id}`);
      const petData = petRes.data; // Здесь petData создается
      setPet(petData);
      
      setEditName(petData.name);
      setEditType(petData.type);
      setEditAge(petData.age);
      setEditGender(petData.gender);
      setEditDescription(petData.description || '');

      // Нормализуем картинки в массив для редактирования
      const petImages = Array.isArray(petData.images) ? petData.images : (petData.image_url || petData.photo_url ? [petData.image_url || petData.photo_url] : []);
      setExistingImages(petImages);
      setActiveImgIndex(0); // Сбрасываем на первое фото при загрузке

      if (user) {
        // 1. Проверяем статус заявки на этого питомца
        try {
          const appCheck = await api.get(`/api/applications/check/${id}`);
          setHasApplied(appCheck.data.applied);
        } catch (e) {
          console.error("Ошибка проверки заявки:", e);
        }

        // 2. Проверяем избранное
        try {
          const favRes = await api.get('/api/favorites');  
          const currentPetId = String(id);
          const alreadyFavorite = favRes.data.some(fav => {
            const favPetId = fav.pet_id ? String(fav.pet_id) : String(fav);
            return favPetId === currentPetId;
          });
          setIsFavorite(alreadyFavorite);
        } catch (e) {
          console.error("Ошибка загрузки избранного:", e);
        }
      } else {
        setHasApplied(false);
        setIsFavorite(false);
      }
    } catch (err) {
      console.error("Ошибка при получении данных:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  
    loadPetData(); 
  }, [id, user]);

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

const toggleFavorite = async () => {
    if (!user) { setModal('notAuth'); return; }
    
    // Сохраняем предыдущее состояние для отката в случае ошибки (оптимистичное обновление)
    const previousState = isFavorite;
    setIsFavorite(!isFavorite); 

    try {
      if (previousState) { 
        // Если уже в избранном - удаляем
        await api.delete(`/api/favorites/${pet.id}`); 
      } else { 
        // Если не в избранном - добавляем
        await api.post(`/api/favorites/${pet.id}`); 
      }
    } catch (err) {
      console.error("Ошибка при обновлении избранного:", err);
      setIsFavorite(previousState); // Возвращаем обратно, если сервер выдал ошибку
      alert("Не удалось обновить избранное");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/pets/${pet.id}`);
      navigate('/pets');
    } catch { alert('Ошибка при удалении'); }
  };

  // ОБРАБОТЧИК СОХРАНЕНИЯ ИЗМЕНЕНИЙ ПРИ РЕДАКТИРОВАНИИ
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let newlyUploadedUrls = [];

      // Загружаем только новые добавленные файлы
      if (editFiles.length > 0) {
        for (const file of editFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
          const filePath = `animals/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('pet-photos')
            .upload(filePath, file);

          if (uploadError) throw new Error('Не удалось загрузить новые фото');

          const { data: publicUrlData } = supabase.storage
            .from('pet-photos')
            .getPublicUrl(filePath);

          newlyUploadedUrls.push(publicUrlData.publicUrl);
        }
      }

      // Сливаем старые оставленные фото и новые загруженные
      const updatedImagesArray = [...existingImages, ...newlyUploadedUrls];

      await api.put(`/api/pets/${pet.id}`, {
        name: editName,
        type: editType,
        age: parseInt(editAge, 10),
        gender: editGender,
        description: editDescription,
        images: updatedImagesArray // отправляем обновленный массив
      });

      alert('Изменения сохранены!');
      setModal(null);
      setEditFiles([]);
      loadPetData(); 
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Ошибка редактирования');
    } finally {
      setSubmitting(false);
    }
  };

  // Перелистывание фотографий по стрелочкам
  const handlePrevImg = (e) => {
    e.stopPropagation(); // Чтобы не открывалось увеличение при клике на стрелку
    setActiveImgIndex((prev) => (prev === 0 ? petImages.length - 1 : prev - 1));
  };

  const handleNextImg = (e) => {
    e.stopPropagation(); // Чтобы не открывалось увеличение при клике на стрелку
    setActiveImgIndex((prev) => (prev === petImages.length - 1 ? 0 : prev + 1));
  };

  if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>Загрузка...</div>;
  if (!pet) return <div style={{ padding: '60px', textAlign: 'center' }}><div style={{ fontSize: '48px' }}>🐾</div><p style={{ fontSize: '18px', color: '#888' }}>Питомец не найден</p><Link to="/pets" style={{ color: '#365E42' }}>← Вернуться в каталог</Link></div>;

  // Формируем массив изображений для рендера галереи
  const petImages = Array.isArray(pet.images) && pet.images.length > 0 
    ? pet.images 
    : (pet.image_url || pet.photo_url ? [pet.image_url || pet.photo_url] : []);
  const currentImage = petImages[activeImgIndex] || null;

  return (
    <div style={{ backgroundColor: '#F8FAF7', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 5%' }}>
        <p style={{ fontSize: '14px', color: '#888', marginBottom: '24px' }}>
          <Link to="/" style={{ color: '#888', textDecoration: 'none' }}>Главная</Link> {' / '} <Link to="/pets" style={{ color: '#888', textDecoration: 'none' }}>Питомцы</Link> {' / '} <span style={{ color: '#1E2D24' }}>{pet.name}</span>
        </p>

        <div style={{ display: 'flex', gap: '48px', alignItems: 'flex-start' }}>
          <div style={{ width: '420px', flexShrink: 0 }}>
            {/* Главное фото со стрелочками навигации */}
            <div style={{ position: 'relative', width: '100%', height: '400px', borderRadius: '16px', overflow: 'hidden', background: '#E8F0E8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {currentImage ? (
                <img 
                  src={currentImage} 
                  alt={pet.name} 
                  onClick={() => setIsZoomed(true)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in' }} 
                />
              ) : (
                <span style={{ fontSize: '100px' }}>{pet.type === 'dog' ? '🐕' : '🐈'}</span>
              )}

              {/* Стрелочки переключения (отображаются только если картинок больше одной) */}
              {petImages.length > 1 && (
                <>
                  <button 
                    onClick={handlePrevImg}
                    style={{
                      position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                      background: 'rgba(255, 255, 255, 0.8)', border: 'none', borderRadius: '50%',
                      width: '38px', height: '38px', fontSize: '22px', fontWeight: 'bold', color: '#365E42',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.15)', transition: 'all 0.2s', zIndex: 10, outline: 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#rgba(255, 255, 255, 1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)'}
                  >
                    ‹
                  </button>
                  <button 
                    onClick={handleNextImg}
                    style={{
                      position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                      background: 'rgba(255, 255, 255, 0.8)', border: 'none', borderRadius: '50%',
                      width: '38px', height: '38px', fontSize: '22px', fontWeight: 'bold', color: '#365E42',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.15)', transition: 'all 0.2s', zIndex: 10, outline: 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)'}
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            {/* МИНИ-ГАЛЕРЕЯ ПОД КАРТИНКОЙ */}
            {petImages.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                {petImages.map((img, idx) => (
                  <img 
                    key={idx}
                    src={img} 
                    alt="" 
                    onClick={() => setActiveImgIndex(idx)}
                    style={{
                      width: '62px',
                      height: '62px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: activeImgIndex === idx ? '2.5px solid #365E42' : '2.5px solid transparent',
                      boxSizing: 'border-box',
                      opacity: activeImgIndex === idx ? 1 : 0.6,
                      transition: 'all 0.2s'
                    }}
                  />
                ))}
              </div>
            )}

            {isAdmin && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button onClick={() => setModal('edit')} style={{ flex: 1, padding: '12px', background: '#365E42', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '15px', cursor: 'pointer' }}>✏️ Изменить</button>
                <button onClick={() => setModal('delete')} style={{ width: '48px', height: '48px', background: '#fff', color: '#C0392B', border: '1.5px solid #C0392B', borderRadius: '10px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              </div>
            )}
          </div>

          <div style={{ flex: 1, position: 'relative' }}>
            <button onClick={toggleFavorite} style={{ position: 'absolute', top: 0, right: 0, background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: isFavorite ? '#E74C3C' : '#ccc', transition: 'color 0.2s' }}>{isFavorite ? '♥' : '♡'}</button>
            <h1 style={{ fontSize: '36px', fontWeight: '700', color: '#1E2D24', marginBottom: '16px', marginTop: 0 }}>{pet.name}</h1>
            <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#444', marginBottom: '24px' }}>{pet.description}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
              <p style={{ margin: 0, fontSize: '15px' }}><span style={{ color: '#365E42', fontWeight: '700' }}>Возраст: </span>{ageLabel(pet.age)}</p>
              <p style={{ margin: 0, fontSize: '15px' }}><span style={{ color: '#365E42', fontWeight: '700' }}>Пол: </span>{pet.gender === 'male' ? 'мальчик' : 'девочка'}</p>
            </div>
            <div style={{ display: 'flex' }}>
  <button 
    onClick={handleApply} 
    disabled={submitting || hasApplied} 
    style={{ 
      flex: 1, 
      padding: '16px 24px', 
      background: hasApplied ? '#95a5a6' : (submitting ? '#D4A010' : '#F4C430'),
      cursor: (submitting || hasApplied) ? 'not-allowed' : 'pointer',
      color: '#fff', 
      border: 'none', 
      borderRadius: '30px', 
      fontWeight: '700', 
      fontSize: '16px', 
      cursor: submitting ? 'not-allowed' : 'pointer', // Меняем курсор
      opacity: submitting ? 0.7 : 1, // Полупрозрачность при отправке
      transition: 'all 0.2s ease', // Плавная анимация
      boxShadow: submitting ? 'none' : '0 4px 15px rgba(244, 196, 48, 0.3)' // Мягкая тень для объема
    }}
    onMouseEnter={(e) => !submitting && (e.target.style.transform = 'scale(1.02)')}
    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
  >
    {hasApplied 
      ? 'Заявка уже отправлена' 
      : (submitting ? 'Отправка...' : 'Забрать домой')
    }
  </button>
</div>
          </div>
        </div>
      </div>

      {/* ── МОДАЛКА УВЕЛИЧЕНИЯ ФОТО (ЛАЙТБОКС) ── */}
      {isZoomed && currentImage && (
        <div 
          onClick={() => setIsZoomed(false)} 
          style={{ 
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            zIndex: 2000, cursor: 'zoom-out' 
          }}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
            <img 
              src={currentImage} 
              alt={pet.name} 
              style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '8px', objectFit: 'contain', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }} 
            />
            <button 
              onClick={() => setIsZoomed(false)}
              style={{
                position: 'absolute', top: '-40px', right: '0', background: 'none', border: 'none',
                color: '#fff', fontSize: '32px', cursor: 'pointer', fontWeight: '300', outline: 'none'
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ── ОСТАЛЬНЫЕ МОДАЛКИ ── */}
      {modal && (
        <div onClick={() => setModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#FDF9EE', borderRadius: '16px', padding: '36px', maxWidth: '440px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', textAlign: 'center', boxSizing: 'border-box' }}>

            {modal === 'notAuth' && <><div style={{ fontSize: '40px', marginBottom: '12px' }}>🔒</div><h3 style={{ color: '#1E2D24', marginBottom: '10px' }}>Необходима авторизация</h3><button onClick={() => setModal(null)} style={greenBtn}>Понятно</button></>}
            
            {modal === 'noProfile' && <><div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div><h3 style={{ color: '#1E2D24', marginBottom: '10px' }}>Заполните профиль</h3><div style={{ display: 'flex', gap: '12px' }}><button onClick={() => setModal(null)} style={outlineBtn}>Отмена</button><button onClick={() => { setModal(null); navigate('/profile'); }} style={greenBtn}>Перейти в профиль</button></div></>}
            
            {modal === 'confirm' && <><div style={{ fontSize: '40px', marginBottom: '12px' }}>{pet.type === 'dog' ? '🐕' : '🐈'}</div><h3 style={{ color: '#1E2D24', marginBottom: '10px' }}>Отправить заявку?</h3><div style={{ display: 'flex', gap: '12px' }}><button onClick={() => setModal(null)} style={outlineBtn}>Нет</button><button onClick={handleSubmitApplication} disabled={submitting} style={greenBtn}>{submitting ? 'Отправка...' : 'Да, отправить'}</button></div></>}
            
            {modal === 'delete' && <><div style={{ fontSize: '40px', marginBottom: '12px' }}>⚠️</div><h3 style={{ color: '#C0392B', marginBottom: '10px' }}>Удалить питомца?</h3><div style={{ display: 'flex', gap: '12px' }}><button onClick={() => setModal(null)} style={outlineBtn}>Отмена</button><button onClick={handleDelete} style={{ ...greenBtn, background: '#C0392B' }}>Удалить</button></div></>}

            {/* ВСПЛЫВАЮЩЕЕ ОКНО РЕДАКТИРОВАНИЯ */}
            {modal === 'edit' && (
              <div style={{ maxHeight: '80vh', overflowY: 'auto', paddingRight: '4px' }}>
                <h3 style={{ color: '#1E2D24', marginBottom: '16px', marginTop: 0 }}>Редактирование профиля</h3>
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
                  {existingImages.length === 0 ? (
                    <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>Нет загруженных фото</p>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {existingImages.map((img, idx) => (
                        <div key={idx} style={{ position: 'relative', width: '55px', height: '55px' }}>
                          <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
                          <button 
                            type="button" 
                            onClick={() => setExistingImages(prev => prev.filter((_, i) => i !== idx))}
                            style={{
                              position: 'absolute', top: '-4px', right: '-4px', background: '#C0392B', color: '#fff',
                              border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px',
                              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700'
                            }}
                            title="Удалить это фото"
                          >✕</button>
                        </div>
                      ))}
                    </div>
                  )}

                  <label style={{ fontSize: '13px', fontWeight: '700', color: '#365E42', marginTop: '6px' }}>Добавить еще фото:</label>
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