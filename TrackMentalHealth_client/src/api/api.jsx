import axios from 'axios';

const chat_url = 'http://localhost:9999/api/chat/';
const Appointment_url = 'http://localhost:9999/api/appointment/';
const psy_url = 'http://localhost:9999/api/psychologist/';
const ai_url = 'http://localhost:9999/api/chatai/';
const notification_url = 'http://localhost:9999/api/notification/';

export const getMessagesBySessionId= async (id) => {
    try {
        const response = await axios.get(chat_url+""+id);
        console.log(response.data);
        return response.data;
        // console.log(response.data);
    } catch (error) {
        console.error('Lỗi khi gọi API:', error);
        throw error;
    }
};

export const getChatSessionsByUserId= async (id) => {
    try {
        const response = await axios.get(chat_url+"session/"+id);
        console.log(response.data);
        return response.data;
        // console.log(response.data);
    } catch (error) {
        console.error('Lỗi khi gọi API:', error);
        throw error;
    }
};


export const getChatSessionsByTwoUserId= async (id1,id2) => {
    try {
        const response = await axios.get(chat_url+`session/${id1}/${id2}`);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi gọi API:', error);
        throw error;
    }
};

export const sendMessage = async (id, message) => {
    try {
        const response = await axios.post(
            `${chat_url}${id}`,
            { message: message }, // nếu backend expects JSON {"message":"..."}
            {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi gọi API:', error);
        throw error;
    }
};

export const getAppointmentsByPsyId= async (id) => {
    try {
        const response = await axios.get(Appointment_url+"list/"+id);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi gọi API:', error);
        throw error;
    }
};

export const getAppointmentById= async (id) => {
    try {
        const response = await axios.get(Appointment_url+""+id);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi gọi API:', error);
        throw error;
    }
};

export const saveAppointment= async (data) => {
    try {
        const response = await axios.post(Appointment_url+"save",data);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi gọi API:', error);
        throw error;
    }
};

export const updateAppointment= async (id,data) => {
    try {
        const response = await axios.put(Appointment_url+`${id}`,data);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi gọi API:', error);
        throw error;
    }
};

export const deleteAppointment= async (id) => {
    try {
        const response = await axios.delete(Appointment_url+`${id}`);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi gọi API:', error);
        throw error;
    }
};



export const getPsychologists= async () => {
    try {
        const response = await axios.get(psy_url);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi gọi API:', error);
        throw error;
    }
};

//AI
export const chatAI = async (data) => {
    try {
        const response = await axios.post(ai_url + 'ask',
            {
                message: data.message,
                userId: data.userId,
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi gọi API:', error);
        throw error;
    }
};

export const getAIHistory = async (userId) => {
    try {
        const response = await axios.get(ai_url + 'history/' + userId, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('History:', response.data);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy lịch sử chat AI:', error);
        throw error;
    }
};

//notifications
export const getNotificationsByUserId = async (userId) => {
    try {
        const response = await axios.get(notification_url+"user/" + userId);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Lỗi:', error);
        throw error;
    }
};

export const changeStatusNotification = async (id) => {
    try {
        const response = await axios.put(notification_url+"changestatus/" + id);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Lỗi:', error);
        throw error;
    }
};







