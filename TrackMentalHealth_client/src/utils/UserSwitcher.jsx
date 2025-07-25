// src/components/UserSwitcher.jsx
import React, { useEffect, useState } from "react";

const DUMMY_USERS = [
    { id: 1, name: "Người dùng 1" },
    { id: 2, name: "Người dùng 2" },
    { id: 3, name: "Người dùng 3" },
    { id: 4, name: "Người dùng 4" },
];

function UserSwitcher({ onChange }) {
    const [selectedId, setSelectedId] = useState(localStorage.getItem("currentUserId") || "1");

    const handleChange = (e) => {
        const newId = e.target.value;
        setSelectedId(newId);
        localStorage.setItem("currentUserId", newId);
        if (onChange) onChange(newId);
        window.location.reload(); // reload để cập nhật toàn bộ app nếu cần
    };

    useEffect(() => {
        localStorage.setItem("currentUserId", selectedId);
    }, [selectedId]);

    return (
        <div className="mb-3">
            <label className="form-label fw-bold">🔐 Chọn User:</label>
            <select className="form-select w-auto d-inline-block ms-2" value={selectedId} onChange={handleChange}>
                {DUMMY_USERS.map(user => (
                    <option key={user.id} value={user.id}>
                        {user.name} (ID: {user.id})
                    </option>
                ))}
            </select>
        </div>
    );
}

export default UserSwitcher;
