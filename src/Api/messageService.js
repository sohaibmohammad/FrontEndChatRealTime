import Api from './axiosConfig.js'
/**
 * جلب الرسائل بناءً على معرف المحادثة
 * @param {Object} params
 * @param {string} params.conversationId
 * @param {string|null} params.cursor
 * @param {number} params.limit
 */

export const getMessages = async ({ conversationId, cursor = null, limit = 20 }) => {
  try {
    // 1. جلب التوكن مباشرة من الـ localStorage
    const token = localStorage.getItem('token'); 

    // 2. إرسال الطلب مع تمرير الـ Body والـ Token في نفس الوقت
    const response = await Api.get(`chat/messages`, {
      // تمرير الـ Body لطلب الـ GET داخل حقل data
      params: {
        conversationId,
        cursor,
        limit,
      },
      // تمرير الـ Token لحماية الطلب
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    
    return response.data;
  } catch (error) {
    console.error("Error fetching messages:", error.response?.data || error.message);
    throw error;
  }
};

//======================send messages=========================
export const sendMessage = async ({ conversationId, content }) => {
  try {
    const token = localStorage.getItem('token');
console.log("hello");

    const response = await Api.post('chat/send', {
      conversationId,
      content
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });

    return response.data;
  } catch (error) {
    console.error("Error sending message:", error.response?.data || error.message);
    throw error;
  }
};