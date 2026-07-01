// src/pages/Pets.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { supabase } from '../api/supabaseClient';
import {
  FaSearch,
  FaPaw,
  FaDog,
  FaCat,
  FaHeart,
  FaRegHeart,
  FaMars,
  FaVenus,
  FaChevronLeft,
  FaChevronRight,
  FaLock
} from "react-icons/fa";

const PETS_PER_PAGE = 9;

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

function ageRange(totalMonths) {
  if (totalMonths < 12) return 'lt1';   
  if (totalMonths <= 36) return '1-3';  
  if (totalMonths <= 96) return '4-8';  
  return 'gt8';                         
}

export default function Pets() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterGender, setFilterGender] = useState('all');
  const [filterAge, setFilterAge] = useState([]);
  const [page, setPage] = useState(1);

  // Стейты для модального окна добавления питомца
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('dog');
  const [newAge, setNewAge] = useState(''); 
  const [newGender, setNewGender] = useState('male');
  const [newDescription, setNewDescription] = useState('');
  const [newFiles, setNewFiles] = useState([]); 
  const [submitting, setSubmitting] = useState(false);
  const [favorites, setFavorites] = useState([]);

  // Стейт для модального окна авторизации (Избранное)
  const [showAuthModal, setShowAuthModal] = useState(false);

  const loadPets = async () => {
    try {
      const res = await api.get('/api/pets');
      setPets(res.data);

      if (user) {
        const favRes = await api.get('/api/favorites');
        const favIds = favRes.data.map(fav => String(fav.pet_id ? fav.pet_id : fav));
        setFavorites(favIds);
      } else {
        setFavorites([]);
      }
    } catch (err) {
      console.error("Ошибка загрузки:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPets();
  }, [user]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  useEffect(() => { setPage(1); }, [search, filterType, filterGender, filterAge]);

  const handleAddPetSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let finalImageUrls = [];

      if (newFiles.length > 0) {
        for (const file of newFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
          const filePath = `animals/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('pet-photos')
            .upload(filePath, file);

          if (uploadError) {
            throw new Error(`Ошибка Supabase: ${uploadError.message}`);
          }

          const { data: publicUrlData } = supabase.storage
            .from('pet-photos')
            .getPublicUrl(filePath);

          finalImageUrls.push(publicUrlData.publicUrl);
        }
      }

      await api.post('/api/pets', {
        name: newName,
        type: newType,
        age: parseInt(newAge, 10),
        gender: newGender,
        description: newDescription,
        images: finalImageUrls 
      });

      alert('Питомец успешно добавлен!');
      setIsAddModalOpen(false);
      
      setNewName(''); setNewType('dog'); setNewAge('');
      setNewGender('male'); setNewDescription(''); setNewFiles([]);
      
      loadPets();
    } catch (err) {
      alert(err.message || 'Ошибка при сохранении карточки');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = pets.filter(p => {
    if (filterType !== 'all' && p.type !== filterType) return false;
    if (filterGender !== 'all' && p.gender !== filterGender) return false;
    if (filterAge.length > 0 && !filterAge.includes(ageRange(p.age))) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PETS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * PETS_PER_PAGE, page * PETS_PER_PAGE);

  const toggleAge = (val) => setFilterAge(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
  const toggleGender = (val) => setFilterGender(prev => prev === val ? 'all' : val);
  const toggleType = (val) => setFilterType(prev => prev === val ? 'all' : val);

  const typeBtn = (val, icon, label) => {
    const active = filterType === val;

    return (
      <button
        onClick={() => toggleType(val)}
        title={label}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: active ? 'none' : '1.5px solid #B0B0B0',
          background: active ? '#F4C430' : '#fff',
          fontSize: '18px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
          boxShadow: active ? '0 2px 6px rgba(244,196,48,0.4)' : 'none'
        }}
      >
        {icon}
      </button>
    );
  };

  const genderBtn = (val, icon, label, color) => {
    const active = filterGender === val;
    return (
      <button onClick={() => toggleGender(val)} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 12px', border: active ? `1.5px solid ${color}` : '1.5px solid transparent', borderRadius: '8px', background: active ? `${color}18` : 'transparent', cursor: 'pointer', fontSize: '14px', color: active ? color : '#555', fontWeight: active ? '600' : '400', transition: 'all 0.2s', textAlign: 'left' }}>
        <span style={{ display: 'flex', alignItems: 'center', fontSize: '16px', color: active ? color : '#777' }}>{icon}</span> {label} {active && <span style={{ marginLeft: 'auto', fontSize: '12px' }}>✓</span>}
      </button>
    );
  };

  return (
    <div style={{ backgroundColor: '#F8FAF7', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 5%', display: 'flex', gap: '32px' }}>

        <aside style={{ width: '220px', flexShrink: 0 }}>
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <input type="text" placeholder="Поиск по имени..." value={search} onChange={e => setSearch(e.target.value)} style={inputStyle} />
            <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }}> <FaSearch /></span>
          </div>

          <div style={{ background: '#F5F5F0', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
              {typeBtn('all', <FaPaw />, 'Все')}
              {typeBtn('dog', <FaDog />, 'Собаки')}
              {typeBtn('cat', <FaCat />, 'Кошки')}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '11px', fontWeight: '700', color: '#888', margin: '0 0 8px', letterSpacing: '0.8px', textTransform: 'uppercase' }}>Пол</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {genderBtn('male', <FaMars />, 'Мальчик', '#4A90D9')}
                {genderBtn('female', <FaVenus />, 'Девочка', '#D9608A')}
              </div>
            </div>

            <div>
              <p style={{ fontSize: '11px', fontWeight: '700', color: '#888', margin: '0 0 8px', letterSpacing: '0.8px', textTransform: 'uppercase' }}>Возраст</p>
              {[['lt1', '< 1 года'], ['1-3', '1–3 года'], ['4-8', '4–8 лет'], ['gt8', '> 8 лет']].map(([val, label]) => (
                <label key={val} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', cursor: 'pointer', fontSize: '14px', color: filterAge.includes(val) ? '#365E42' : '#444', fontWeight: filterAge.includes(val) ? '600' : '400' }}>
                  <input type="checkbox" checked={filterAge.includes(val)} onChange={() => toggleAge(val)} style={{ accentColor: '#365E42', width: '15px', height: '15px' }} />
                  {label}
                </label>
              ))}
            </div>

            {(filterType !== 'all' || filterGender !== 'all' || filterAge.length > 0 || search) && (
              <button onClick={() => { setFilterType('all'); setFilterGender('all'); setFilterAge([]); setSearch(''); }} style={{ marginTop: '14px', width: '100%', padding: '8px', background: 'transparent', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px', color: '#888', cursor: 'pointer' }}>Сбросить фильтры</button>
            )}
          </div>

          {isAdmin && (
            <button onClick={() => setIsAddModalOpen(true)} style={{ width: '100%', padding: '12px', background: '#F4C430', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '15px', cursor: 'pointer' }}>+ Добавить питомца</button>
          )}
        </aside>

        <div style={{ flex: 1 }}>
          {loading ? (
            <p style={{ color: '#888' }}>Загрузка питомцев...</p>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
                <FaPaw />
              </div>
              <p style={{ fontSize: '16px' }}>Питомцы не найдены</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
                {paginated.map(pet => (
                  <PetItem 
                    key={pet.id} 
                    pet={pet} 
                    user={user} 
                    isFavoriteInit={favorites.includes(String(pet.id))} 
                    onAuthRequired={() => setShowAuthModal(true)} 
                  />
                ))}
              </div>
              {totalPages > 1 && <Pagination page={page} totalPages={totalPages} setPage={setPage} />}
            </>
          )}
        </div>
      </div>

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

      {/* ── МОДАЛЬНОЕ ОКНО ДОБАВЛЕНИЯ ПИТОМЦА ── */}
      {isAddModalOpen && (
        <div onClick={() => setIsAddModalOpen(false)} style={modalOverlayStyle}>
          <div onClick={e => e.stopPropagation()} style={modalContentStyle}>
            <h3 style={{ color: '#1E2D24', marginBottom: '16px', marginTop: 0 }}>Добавление питомца</h3>
            <form onSubmit={handleAddPetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
              <input type="text" placeholder="Кличка" value={newName} onChange={e => setNewName(e.target.value)} required style={inputStyle} />
              
              <select value={newType} onChange={e => setNewType(e.target.value)} style={inputStyle}>
                <option value="dog">Собака</option>
                <option value="cat">Кошка</option>
              </select>

              <input type="number" placeholder="Возраст в месяцах (например: 5 или 24)" value={newAge} onChange={e => setNewAge(e.target.value)} required style={inputStyle} />

              <select value={newGender} onChange={e => setNewGender(e.target.value)} style={inputStyle}>
                <option value="male">Мальчик</option>
                <option value="female">Девочка</option>
              </select>

              <textarea placeholder="Описание питомца..." value={newDescription} onChange={e => setNewDescription(e.target.value)} style={{ ...inputStyle, height: '80px', resize: 'none' }} />

              <label style={{ fontSize: '13px', fontWeight: '700', color: '#365E42' }}>Выбрать фото (можно несколько):</label>
              <input type="file" accept="image/*" multiple onChange={e => setNewFiles(Array.from(e.target.files))} required />

              <div style={{ display: 'flex', gap: '12px', marginTop: '14px' }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} style={outlineBtn}>Отмена</button>
                <button type="submit" disabled={submitting} style={greenBtn}>{submitting ? 'Загрузка...' : 'Сохранить'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function PetItem({ pet, user, isFavoriteInit, onAuthRequired }) {
  const [isFavorite, setIsFavorite] = useState(isFavoriteInit);

  useEffect(() => {
    setIsFavorite(isFavoriteInit);
  }, [isFavoriteInit]);

  const petImages = Array.isArray(pet.images) && pet.images.length > 0 
    ? pet.images 
    : (pet.image_url || pet.photo_url ? [pet.image_url || pet.photo_url] : []);
  const imageSrc = petImages[0];

  const proxiedImageSrc = imageSrc ? `https://wsrv.nl/?url=${encodeURIComponent(imageSrc)}` : null;

  const handleFavoriteClick = async (e) => {
    e.preventDefault(); 
    e.stopPropagation(); 

    if (!user) {
      onAuthRequired();
      return;
    }

    const previousState = isFavorite;
    setIsFavorite(!isFavorite);

    try {
      if (previousState) {
        await api.delete(`/api/favorites/${pet.id}`);
      } else {
        await api.post(`/api/favorites/${pet.id}`);
      }
    } catch (err) {
      console.error("Ошибка при обновлении избранного:", err);
      setIsFavorite(previousState);
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
          position: 'relative'
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isFavorite ? '#E63946' : '#1E2D24', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 2,
            transition: 'transform 0.1s ease, color 0.2s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {isFavorite ? <FaHeart style={{ fontSize: '18px' }} /> : <FaRegHeart style={{ fontSize: '18px' }} />}
        </button>

        <div style={{ width: '100%', height: '200px', background: '#E8F0E8', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {proxiedImageSrc ? (
            <img src={proxiedImageSrc} alt={pet.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : pet.type === 'dog' ? (
            <FaDog style={{ fontSize: '60px', color: '#365E42' }} />
          ) : (
            <FaCat style={{ fontSize: '60px', color: '#365E42' }} />
          )}
        </div>
        
        <div style={{ padding: '14px 16px' }}>
          <p style={{ margin: '0 0 4px', fontWeight: '700', fontSize: '16px', color: '#1E2D24' }}>{pet.name}</p>
          
          <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#666', display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
            {pet.gender === 'male' ? (
              <>
                <FaMars style={{ color: '#4A90D9', fontSize: '14px' }} /> мальчик
              </>
            ) : (
              <>
                <FaVenus style={{ color: '#D9608A', fontSize: '14px' }} /> девочка
              </>
            )}
            <span>· {ageLabel(pet.age)}</span>
          </p>
          
          <div style={{ display: 'inline-block', padding: '6px 18px', border: '1.5px solid #365E42', borderRadius: '20px', fontSize: '13px', color: '#365E42', fontWeight: '500' }}>Подробнее</div>
        </div>
      </div>
    </Link>
  );
}

function Pagination({ page, totalPages, setPage }) {
  const getPages = () => {
    const pages = [];
    if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) pages.push(i); } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };
  const btnStyle = (active) => ({ width: '36px', height: '36px', borderRadius: '50%', border: active ? 'none' : '1.5px solid #D0D0D0', background: active ? '#365E42' : '#fff', color: active ? '#fff' : '#333', fontWeight: active ? '700' : '400', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' });
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', alignItems: 'center', paddingBottom: '20px' }}>
      <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ ...btnStyle(false), opacity: page === 1 ? 0.4 : 1 }}>
        <FaChevronLeft style={{ fontSize: '11px' }} />
      </button>
      {getPages().map((p, i) => p === '...' ? <span key={`dot${i}`} style={{ padding: '0 4px', color: '#888' }}>...</span> : <button key={p} onClick={() => setPage(p)} style={btnStyle(p === page)}>{p}</button>)}
      <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ ...btnStyle(false), opacity: page === totalPages ? 0.4 : 1 }}>
        <FaChevronRight style={{ fontSize: '11px' }} />
      </button>
    </div>
  );
}

const modalOverlayStyle = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalContentStyle = { background: '#FDF9EE', borderRadius: '16px', padding: '32px', maxWidth: '420px', width: '90%', boxSizing: 'border-box', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', textAlign: 'center' };
const inputStyle = { width: '100%', padding: '10px', border: '1.5px solid #D0D0D0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none' };
const greenBtn = { flex: 1, padding: '12px', background: '#365E42', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '15px', cursor: 'pointer' };
const outlineBtn = { flex: 1, padding: '12px', background: '#fff', color: '#365E42', border: '1.5px solid #365E42', borderRadius: '8px', fontWeight: '600', fontSize: '15px', cursor: 'pointer' };