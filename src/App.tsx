import { Routes, Route } from 'react-router-dom'
import { useEnsureLang } from './hooks/useEnsurelang';
import Home from './pages/Home'
import TestSelection from './pages/TestSelection'
import TestEarSelection from './pages/TestEarSelection';
import Manual from './pages/Manual';
import Calibration from './pages/Calibration'
import StartGame from './pages/StartGame';
import ActiveTest from './pages/ActiveTest'
import Finish from './pages/Finish';
import Results from './pages/Results'

function App() {
  useEnsureLang();

  return (
    <div className="min-h-screen bg-slate-50">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/select" element={<TestSelection />} />
        <Route path="/select-ear" element={<TestEarSelection />} />
        <Route path="/manual" element={<Manual />} />
        <Route path="/calibration" element={<Calibration />} />
        <Route path="/start-game" element={<StartGame />} />
        <Route path="/test" element={<ActiveTest />} />
        <Route path="/finish" element={<Finish />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </div>
  )
}

export default App