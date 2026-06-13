import Api from "./axiosConfig.js";

//===========GetAllConversions=========
export const getAllConversions = async () => {
    try {

             const token = localStorage.getItem('token');
        console.log(token);
        const response = await Api.get('/Conversation/chats', {  

            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        console.log(response.data);
        return response.data;
        

    } catch (error) {
        console.error("Error fetching conversions:", error);
    }

}