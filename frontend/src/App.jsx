import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Alerts from './pages/Alerts'
import LiveMap from './pages/LiveMap'
import Schedules from './pages/Schedules'
import PassManager from './pages/PassManager'
import Complaints from './pages/Complaints'
import Login from './pages/Login'
import Register from './pages/Register'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/map" element={<LiveMap />} />
        <Route path="/schedules" element={<Schedules />} />
        <Route path="/passes" element={<PassManager />} />
        <Route path="/complaints" element={<Complaints />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  )
}
