import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DeviceEventEmitter} from "react-native";


const axiosMobile = axios.create({
    baseURL: `${process.env.EXPO_PUBLIC_API_URL}/api`,
});

axiosMobile.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('userToken');

    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axiosMobile.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.warn("🔒 [Auth] Token expiré. Émission du signal de déconnexion.");

            DeviceEventEmitter.emit('custom_force_logout');
        }
        return Promise.reject(error);
    }
);
export default axiosMobile;