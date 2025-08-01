import axios from 'axios';

const chat_url = 'http://localhost:9999/api/chat/';
const Appointment_url = 'http://localhost:9999/api/appointment/';
const psy_url = 'http://localhost:9999/api/psychologist/';
const ai_url = 'http://localhost:9999/api/chatai/';
const notification_url = 'http://localhost:9999/api/notification/';
const chatGroup_url = "http://localhost:9999/api/chatgroup/";
const upload_url = 'http://localhost:9999/api/upload';


export const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await axios.post(upload_url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.url;
};


export const getMessagesBySessionId = async (id) => {
    try {
        const response = await axios.get(chat_url + id);
        console.log(response.data);
        return response.data;
        // console.log(response.data);
    } catch (error) {
        console.error('Lỗi khi gọi API:', error);
        throw error;
    }
};
//check ủnread 

export const hasUnreadMessages = async (id) => {
    try {
        const response = await axios.get(`${chat_url}has-unread/${id}`);
        console.log(response.data);
        return response.data;
        // console.log(response.data);
    } catch (error) {
        console.error('Lỗi khi gọi API:', error);
        throw error;
    }
};




//create chat sesssiom
export const initiateChatSession = async (senderId, receiverId) => {
    try {
        const res = await axios.post(`${chat_url}session/initiate/${senderId}/${receiverId}`);
        return res.data;
    } catch (error) {
        console.error("❌ Failed to initiate session:", error);
        throw error;
    }
};


export const getChatSessionsByUserId = async (id) => {
    try {
        const response = await axios.get(chat_url + "session/" + id);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi gọi API:', error);
        throw error;
    }
};


//appointment
export const getAppointmentByUserId = async (id) => {
    try {
        const response = await axios.get(Appointment_url + "list/" + id);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi gọi API:', error);
        throw error;
    }
};

export const getAppointmentById = async (id) => {
    try {
        const response = await axios.get(Appointment_url + "" + id);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi gọi API:', error);
        throw error;
    }
};

//get appointment by psychologist
export const getAppointmentByPsyId = async (psyId) => {
    try {
        const response = await axios.get(Appointment_url + "psychologist/" + psyId);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi gọi API:', error);
        throw error;
    }
};

export const saveAppointment = async (data) => {
    try {
        const response = await axios.post(Appointment_url + "save", data);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi gọi API:', error);
        throw error;
    }
};

export const updateAppointment = async (id, data) => {
    try {
        const response = await axios.put(`${Appointment_url}${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi cập nhật lịch hẹn:', error);
        throw error;
    }
};


export const deleteAppointment = async (id) => {
    try {
        const response = await axios.delete(Appointment_url + `${id}`);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi gọi API:', error);
        throw error;
    }
};



export const getPsychologists = async () => {
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
        const response = await axios.get(notification_url + "user/" + userId);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Lỗi:', error);
        throw error;
    }
};

//creat new notification
export const saveNotification = async (data) => {
    try {
        const response = await axios.post(notification_url + "save", data);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Lỗi:', error);
        throw error;
    }
};


export const changeStatusNotification = async (id) => {
    try {
        const response = await axios.put(notification_url + "changestatus/" + id);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Lỗi:', error);
        throw error;
    }
};

export const deleteNotificationById = async (id) => {
    try {
        const response = await axios.delete(notification_url + "delete/" + id);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Lỗi:', error);
        throw error;
    }
};

//chat group
export const getAllChatGroup = async () => {
    try {
        const response = await axios.get(chatGroup_url + "findAll");
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Lỗi:', error);
        throw error;
    }
};

//get chat group by creator id
export const getChatGroupByCreatorId = async (id) => {
    try {
        const response = await axios.get(chatGroup_url + "createdBy/" + id);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Lỗi:', error);
        throw error;
    }
};

//get group by id group
export const getChatGroupById = async (id) => {
    try {
        const response = await axios.get(chatGroup_url + id);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Lỗi:', error);
        throw error;
    }
};

//get msg from group id
export const getMessagesByGroupId = async (id) => {
    try {
        const response = await axios.get(chatGroup_url + "messages/" + id);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Lỗi:', error);
        throw error;
    }
};

//get user by group id :
export const findUsersByGroupId = async (groupId, currentUserId) => {
    try {
        const response = await axios.get(`${chatGroup_url}group/users/${groupId}/${currentUserId}`);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Lỗi:', error);
        throw error;
    }
};

//delete my group
export const deleteGroupById = async (id) => {
    try {
        const response = await axios.delete(chatGroup_url + "delete/" + id);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Lỗi:', error);
        throw error;
    }
};
//add new group
export const createNewGroup = async (groupData, file) => {
    const formData = new FormData();
    formData.append(
        "chatGroup",
        new Blob([JSON.stringify(groupData)], { type: "application/json" })
    );
    if (file) formData.append("file", file);

    try {
        const response = await axios.post(chatGroup_url + "create", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi:", error);
        throw error;
    }
};

//update group
export const updateGroupById = async (id, data) => {
    try {
        console.log("Sending group:", data); // kiểm tra kỹ
        const response = await axios.put(chatGroup_url + "edit/" + id, data);
        return response.data;
    } catch (error) {
        console.error('Lỗi:', error);
        throw error;
    }
};

//seen message
export const changeStatusIsRead = async (sessionId, receiverId) => {
    try {
        const response = await axios.put(`${chat_url}changeStatus/${sessionId}/${receiverId}`);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái isRead:", error);
        throw error;
    }
};











