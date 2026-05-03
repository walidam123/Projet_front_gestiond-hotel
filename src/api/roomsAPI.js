import api from './axiosInstance';

export const getAllRooms = () => api.get('/rooms');
export const updateRoom = (id, data) => api.put(`/rooms/${id}`, data);
