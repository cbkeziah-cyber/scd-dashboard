import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Overview from './pages/Overview'
import Traffic from './pages/Traffic'
import Keywords from './pages/Keywords'
import Ecommerce from './pages/Ecommerce'
import OnPageSEO from './pages/OnPageSEO'
import Settings from './pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Overview />} />
          <Route path="traffic" element={<Traffic />} />
          <Route path="keywords" element={<Keywords />} />
          <Route path="ecommerce" element={<Ecommerce />} />
          <Route path="on-page" element={<OnPageSEO />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
