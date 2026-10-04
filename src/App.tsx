import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { UiShowcase } from '@/features/ui-showcase/UiShowcase'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<h1>Examen Final BD · IS644</h1>} />
        {import.meta.env.DEV && <Route path="/ui" element={<UiShowcase />} />}
      </Routes>
    </BrowserRouter>
  )
}

export default App
