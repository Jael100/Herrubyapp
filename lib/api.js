// client/src/lib/api.js — Replit version: relative URLs, same-origin
import { supabase } from './supabase';
const BASE = process.env.NEXT_PUBLIC_API_URL || '';
async function getAuthHeader() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) return { Authorization: `Bearer ${session.access_token}` };
  return {};
}
async function apiCall(path, options = {}) {
  const authHeaders = await getAuthHeader();
  const isFormData = options.body instanceof FormData;
  const res = await fetch(`${BASE}${path}`, { ...options, headers: { ...(!isFormData && { 'Content-Type': 'application/json' }), ...authHeaders, ...options.headers } });
  if (res.status === 401) { await supabase.auth.signOut(); window.location.href = '/'; return; }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}
export const api = {
  auth: { syncProfile: (p) => apiCall('/api/auth/sync', { method:'POST', body:JSON.stringify(p) }) },
  profile: {
    get: () => apiCall('/api/profile'),
    update: (d) => apiCall('/api/profile', { method:'PATCH', body:JSON.stringify(d) }),
    saveOnboarding: (d) => apiCall('/api/profile/onboarding', { method:'POST', body:JSON.stringify(d) }),
  },
  kyc: {
    initiate: () => apiCall('/api/kyc/initiate', { method:'POST' }),
    submit: (fd) => apiCall('/api/kyc/submit', { method:'POST', body:fd }),
    status: () => apiCall('/api/kyc/status'),
  },
  body: {
    getLogs: (days=21) => apiCall(`/api/body/logs?days=${days}`),
    saveLog: (d) => apiCall('/api/body/logs', { method:'POST', body:JSON.stringify(d) }),
    getTrends: () => apiCall('/api/body/trends'),
  },
  programs: {
    list: (p={}) => { const q=new URLSearchParams(p).toString(); return apiCall(`/api/programs${q?'?'+q:''}`); },
    book: (d) => apiCall('/api/programs/book', { method:'POST', body:JSON.stringify(d) }),
    getUserBookings: () => apiCall('/api/programs/bookings'),
    submitReport: (id,d) => apiCall(`/api/programs/bookings/${id}/report`, { method:'PATCH', body:JSON.stringify(d) }),
  },
  wallet: {
    get: () => apiCall('/api/wallet'),
    initiateTopup: (packageId) => apiCall('/api/wallet/topup/initiate', { method:'POST', body:JSON.stringify({packageId}) }),
    confirmTopup: (piId,pkg) => apiCall('/api/wallet/topup/confirm', { method:'POST', body:JSON.stringify({payment_intent_id:piId,package_id:pkg}) }),
    sendGift: (d) => apiCall('/api/wallet/gift/send', { method:'POST', body:JSON.stringify(d) }),
    redeemGift: (code) => apiCall('/api/wallet/gift/redeem', { method:'POST', body:JSON.stringify({code}) }),
    activateEmployer: (code) => apiCall('/api/wallet/employer/activate', { method:'POST', body:JSON.stringify({code}) }),
  },
  circles: {
    list: () => apiCall('/api/circles'),
    join: (id) => apiCall(`/api/circles/${id}/join`, { method:'POST' }),
    leave: (id) => apiCall(`/api/circles/${id}/leave`, { method:'DELETE' }),
    getPosts: (id) => apiCall(`/api/circles/${id}/posts`),
    createPost: (id,d) => apiCall(`/api/circles/${id}/posts`, { method:'POST', body:JSON.stringify(d) }),
    likePost: (id) => apiCall(`/api/circles/posts/${id}/like`, { method:'POST' }),
    getEvents: () => apiCall('/api/circles/events'),
    rsvp: (id,status) => apiCall(`/api/circles/events/${id}/rsvp`, { method:'POST', body:JSON.stringify({status}) }),
  },
  hub: {
    getCategories: () => apiCall('/api/hub/categories'),
    getContent: (cat,type) => apiCall(`/api/hub/content?category=${cat}&type=${type}`),
    register: (id) => apiCall(`/api/hub/content/${id}/register`, { method:'POST' }),
    save: (id) => apiCall(`/api/hub/content/${id}/save`, { method:'POST' }),
    unsave: (id) => apiCall(`/api/hub/content/${id}/save`, { method:'DELETE' }),
  },
};
