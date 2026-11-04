import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';

export default function App(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products/:id" element={<ProductPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
