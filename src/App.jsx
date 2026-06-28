import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
//import Pets from './pages/Pets';
//import PetCard from './pages/PetCard';
import About from './pages/About';
import Help from './pages/Help';
//import Auth from './pages/Auth';
import Profile from './pages/Profile';

const Pets = () => <div style={{ padding: '40px' }}><h2>Каталог питомцев</h2></div>;
const PetCard = () => <div style={{ padding: '40px' }}><h2>Карточка питомца</h2></div>;

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Добавляем width: '100%' к главному контейнеру */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
          
          <Header />
          
          <main style={{ flex: 1, width: '100%' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/pets" element={<Pets />} />
              <Route path="/pets/:id" element={<PetCard />} />
              <Route path="/about" element={<About />} />
              <Route path="/help" element={<Help />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;