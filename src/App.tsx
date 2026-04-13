import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Create } from './pages/Create';
import { Wait } from './pages/Wait';
import { Join } from './pages/Join';
import { Result } from './pages/Result';

function App() {
  return (
    <Router>
      <div className="min-h-screen w-full bg-background text-foreground ambient-gradient flex justify-center">
        {/* Mobile container constraint for desktop viewing */}
        <div className="w-full max-w-md min-h-screen relative overflow-hidden bg-background shadow-2xl sm:border-x sm:border-border/50">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<Create />} />
            <Route path="/wait/:roomId" element={<Wait />} />
            <Route path="/join/:roomId" element={<Join />} />
            <Route path="/result/:roomId" element={<Result />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
