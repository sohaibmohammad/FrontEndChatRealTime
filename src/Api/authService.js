import Api from './axiosConfig.js'

// =========login=========
export const login = async (credentials) => {
    try{
  const response = await Api.post('/Auth/login', credentials);

     console.log('Login response:', response.data); 
     if (response.data && response.data.accessToken) {
            localStorage.setItem('token', response.data.accessToken);
            localStorage.setItem('refresh', response.data.refreshToken);
        }
                return response;

        }catch (error) {
        throw error.response ? error.response.data : new Error("Login failed");
    }
};