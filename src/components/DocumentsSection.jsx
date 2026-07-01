// src/components/DocumentsSection.jsx
// Блок "Документы и реквизиты" для страницы "О приюте" — кликабельные документы для скачивания
import termsPdf from '../assets/docs/terms-and-conditions.pdf';
import privacyPdf from '../assets/docs/privacy-policy.pdf';
import catGif from '../assets/cat-3.gif'; // Импорт новой GIF

const DOCUMENTS = [
  { title: 'Условия и положения', file: termsPdf, filename: 'Условия и положения.pdf' },
  { title: 'Политика конфиденциальности', file: privacyPdf, filename: 'Политика конфиденциальности.pdf' },
];

export default function DocumentsSection() {
  return (
    <section style={{
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '0px 0%',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center' // Центрируем GIF и контент по горизонтали
    }}>
      
      {/* GIF-анимация без отступов снизу */}
      <img 
        src={catGif} 
        alt="Кот" 
        style={{
          display: 'block',
          margin: '0',
          padding: '0',
          marginBottom: '0px', // Гарантируем отсутствие отступа снизу
          maxWidth: '380px',   // Можете изменить размер под ваш дизайн
          width: '100%',
          objectFit: 'contain'
        }}
      />

      <h2 style={{
        fontSize: '32px',
        fontWeight: '700',
        color: '#1E2D24',
        marginTop: '0px',      // Обязательно сбрасываем стандартный отступ H2 сверху
        marginBottom: '36px',
      }}>
        Документы и реквизиты
      </h2>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '36px',
      }}>
        {DOCUMENTS.map((doc) => (
          <DocumentLink key={doc.title} doc={doc} />
        ))}
      </div>
    </section>
  );
}

// ── Кликабельная ссылка-документ с иконкой ──────────────────────────────────
function DocumentLink({ doc }) {
  return (
    <a
      href={doc.file}
      download={doc.filename}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        textDecoration: 'none',
        color: '#1E2D24',
        fontSize: '17px',
        fontWeight: '500',
        transition: 'color 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.color = '#365E42'}
      onMouseLeave={e => e.currentTarget.style.color = '#1E2D24'}
    >
      {/* Иконка документа — повторяет стиль с макета */}
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M6 2C5.44772 2 5 2.44772 5 3V21C5 21.5523 5.44772 22 6 22H18C18.5523 22 19 21.5523 19 21V8L13 2H6Z"
          stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"
        />
        <path d="M13 2V8H19" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <line x1="8.5" y1="13" x2="15.5" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span style={{ borderBottom: '1px solid transparent' }}>
        {doc.title}
      </span>
    </a>
  );
}