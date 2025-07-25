// src/utils/getCurrentUserID.js
export function getCurrentUserId() {
    return localStorage.getItem("currentUserId") || "1";
}
