import apiService from './api';

const buildQueryString = (params) => {
  const query = new URLSearchParams(params).toString();
  return query ? `?${query}` : '';
};

export const productAPI = {
  getProducts: (params) => apiService.request(`/products${buildQueryString(params)}`),
  getProduct: (id) => apiService.request(`/products/${id}`),
  createProduct: (productData) => apiService.request('/products', { method: 'POST', body: JSON.stringify(productData) }),
  updateProduct: (id, productData) => apiService.request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(productData) }),
  deleteProduct: (id) => apiService.request(`/products/${id}`, { method: 'DELETE' }),
};
