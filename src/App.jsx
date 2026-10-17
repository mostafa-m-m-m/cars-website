import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { SettingsProvider } from './context/SettingsContext'
import { BookingsProvider } from './context/BookingsContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Cars from './pages/Cars'
import CarDetail from './pages/CarDetail'
import Bookings from './pages/Bookings'
import About from './pages/About'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'
import { Blog, BlogPost } from './pages/Blog'

// Old URLs from the first version keep working.
function LegacyPost() {
  const { slug } = useParams()
  return <Navigate to={`/blog/${slug}`} replace />
}

export default function App() {
  return (
    <SettingsProvider>
      <BookingsProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="cars" element={<Cars />} />
              <Route path="cars/:id" element={<CarDetail />} />
              <Route path="bookings" element={<Bookings />} />
              <Route path="blog" element={<Blog />} />
              <Route path="blog/:id" element={<BlogPost />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
              <Route path="home" element={<Navigate to="/" replace />} />
              <Route path="blogs" element={<Navigate to="/blog" replace />} />
              <Route path="blogs/:slug" element={<LegacyPost />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </BookingsProvider>
    </SettingsProvider>
  )
}
