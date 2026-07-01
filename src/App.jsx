import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Pets from './pages/Pets';
import PetCard from './pages/PetCard';
import About from './pages/About';
import Help from './pages/Help';
import Profile from './pages/Profile';
import AboutTeam from './pages/AboutTeam';
import Articles from './pages/Articles';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
          <Header />
          <main style={{ flex: 1, width: '100%' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/pets" element={<Pets />} />
              <Route path="/pets/:id" element={<PetCard />} />
              <Route path="/about" element={<About />} />
              <Route path="/team" element={<AboutTeam />} />
              <Route path="/help" element={<Help />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/articles" element={<Articles />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;