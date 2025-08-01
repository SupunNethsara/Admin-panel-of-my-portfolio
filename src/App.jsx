import { Routes, Route } from 'react-router-dom'
import Dashboard from './Components/Main Components/Dashboard'


export default function App() {
  return (
    <Routes>
      <Route path="/*" element={<Dashboard/>} />
    </Routes>
  )
}