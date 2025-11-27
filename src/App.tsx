// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Tu będą kolejne strony, np. */}
        {/* <Route path="/zaloguj" element={<Login />} /> */}
        {/* <Route path="/forum" element={<Forum />} /> */}
      </Routes>
    </Router>
  );
}

export default App;