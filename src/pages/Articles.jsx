import { useEffect, useState } from 'react';
import api from '../api/axios';
import { FaChevronLeft, FaChevronRight, FaPaw } from 'react-icons/fa';

const ARTICLES_PER_PAGE = 9;
const SYNC_INTERVAL_MS = 60 * 60 * 1000;

export default function Articles() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [page, setPage] = useState(1);

    // Плавная прокрутка наверх при переключении страниц
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [page]);

    // Загрузка статей из БД
    const fetchArticles = async () => {
        try {
            const res = await api.get('/api/articles');
            setArticles(res.data);
        } catch (err) {
            console.error('Ошибка при загрузке статей:', err);
        } finally {
            setLoading(false);
        }
    };

    // Автосинхронизация при заходе на страницу — не чаще 1 раза в час.
    // ПРИМЕЧАНИЕ: основное расписание (раз в час) теперь живёт на сервере
    // через node-cron (см. articles.js), поэтому этот блок — просто
    // подстраховка на случай, если пользователь зашёл раньше, чем
    // сервер успел синхронизироваться сам, или сервер долго не перезапускали.
    useEffect(() => {
        const autoSync = async () => {
            const lastSync = localStorage.getItem('articles_last_sync');
            const shouldSync = !lastSync || (Date.now() - parseInt(lastSync, 10)) > SYNC_INTERVAL_MS;

            if (shouldSync) {
                setSyncing(true);
                try {
                    await api.post('/api/articles/sync');
                    localStorage.setItem('articles_last_sync', Date.now().toString());
                } catch (err) {
                    console.error('Авто-синхронизация не удалась:', err);
                } finally {
                    setSyncing(false);
                }
            }

            // В любом случае загружаем статьи после попытки синхронизации
            fetchArticles();
        };

        autoSync();
    }, []);

    // Пагинация
    const totalPages = Math.ceil(articles.length / ARTICLES_PER_PAGE);
    const displayedArticles = articles.slice((page - 1) * ARTICLES_PER_PAGE, page * ARTICLES_PER_PAGE);

    const getPages = () => {
        const pages = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (page <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages);
            } else if (page >= totalPages - 2) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
            }
        }
        return pages;
    };

    const btnStyle = (isActive) => ({
        padding: '6px 12px',
        border: '1px solid #365E42',
        borderRadius: '8px',
        background: isActive ? '#365E42' : '#FFFFFF',
        color: isActive ? '#FFFFFF' : '#365E42',
        fontWeight: '700',
        cursor: 'pointer',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '36px',
        height: '36px',
        transition: 'all 0.2s',
    });

    return (
        <main style={{ backgroundColor: '#F8FAF7', minHeight: 'calc(100vh - 80px)', padding: '60px 40px', boxSizing: 'border-box' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

                {/* Заголовок секции */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div>
                        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1E2D24', margin: '0 0 8px 0' }}>
                            Полезные советы и блоги ветеринаров
                        </h1>
                        <p style={{ fontSize: '15px', color: '#555', margin: 0 }}>
                            Актуальные материалы о здоровье, уходе и воспитании ваших питомцев
                        </p>
                        {/* Подсказка об авто-обновлении */}
                        {syncing && (
                            <p style={{ fontSize: '13px', color: '#888', margin: '6px 0 0', fontStyle: 'italic' }}>
                                Обновляем ленту...
                            </p>
                        )}
                    </div>
                </div>

                {loading ? (
                    <p style={{ color: '#888', textAlign: 'center', fontSize: '16px' }}>Загрузка материалов...</p>
                ) : articles.length === 0 ? (
                    <p style={{ color: '#888', textAlign: 'center', fontSize: '16px' }}>Статьи пока не добавлены.</p>
                ) : (
                    <div>
                        {/* Сетка карточек */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px', marginBottom: '20px' }}>
                            {displayedArticles.map((article) => (
                                <div
                                    key={article.id}
                                    style={{
                                        background: '#FFFFFF',
                                        borderRadius: '16px',
                                        border: '1px solid #E5E5E5',
                                        overflow: 'hidden',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'transform 0.2s',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                                >
                                    {/* Превью */}
                                    <div style={{ height: '180px', width: '100%', background: '#F5F5F5', overflow: 'hidden' }}>
                                        {article.image_url ? (
                                            <img src={article.image_url} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CCC' }}>
                                                <FaPaw style={{ fontSize: '48px' }} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Контент */}
                                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <span style={{ fontSize: '12px', color: '#888', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                                            {article.source_name || 'Ветеринарный блог'}
                                        </span>
                                        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1E2D24', margin: '0 0 10px 0', lineHeight: '1.4' }}>
                                            {article.title}
                                        </h3>
                                        <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.5', margin: '0 0 20px 0', flex: 1 }}>
                                            {article.description
                                                ? article.description.replace(/<[^>]*>/g, '').slice(0, 140) + '...'
                                                : 'Нажмите читать, чтобы узнать подробнее...'}
                                        </p>
                                        <a
                                            href={article.link}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={{ textDecoration: 'none', color: '#365E42', fontSize: '14px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', marginTop: 'auto', width: 'fit-content' }}
                                        >
                                            Читать оригинал →
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Пагинация */}
                        {totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '40px' }}>
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ ...btnStyle(false), opacity: page === 1 ? 0.4 : 1, cursor: page === 1 ? 'not-allowed' : 'pointer' }}>
                                    <FaChevronLeft style={{ fontSize: '11px' }} />
                                </button>
                                {getPages().map((p, i) => p === '...'
                                    ? <span key={`dot${i}`} style={{ padding: '0 4px', color: '#888' }}>...</span>
                                    : <button key={p} onClick={() => setPage(p)} style={btnStyle(p === page)}>{p}</button>
                                )}
                                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ ...btnStyle(false), opacity: page === totalPages ? 0.4 : 1, cursor: page === totalPages ? 'not-allowed' : 'pointer' }}>
                                    <FaChevronRight style={{ fontSize: '11px' }} />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}