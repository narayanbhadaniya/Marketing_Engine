import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

export const brandAPI = {
  setup: (data) => api.post('/brand/setup', data),
  getAll: () => api.get('/brand/all'),
  getOne: (id) => api.get(`/brand/${id}`),
}

export const contentAPI = {
  generate: (data) => api.post('/content/generate', data),
  refine: (data) => api.post('/content/refine', data),
  getPieces: (brandId) => api.get(`/content/pieces/${brandId}`),
}

export const repurposeAPI = {
  process: (data) => api.post('/repurpose/process', data),
}

export const adAPI = {
  generate: (data) => api.post('/adcopy/generate', data),
  updateStatus: (id, status) => api.put(`/adcopy/status/${id}`, { status }),
}

export const sentimentAPI = {
  analyse: (formData) =>
    api.post('/sentiment/analyse', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}

export const calendarAPI = {
  getItems: (brandId) => api.get(`/calendar/items/${brandId}`),
  schedule: (data) => api.put('/calendar/schedule', data),
  suggest: (brandId) => api.get(`/calendar/suggest/${brandId}`),
}
