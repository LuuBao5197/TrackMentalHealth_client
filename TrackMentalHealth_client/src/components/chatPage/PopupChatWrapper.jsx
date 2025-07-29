import React from "react";

const PopupChatWrapper = ({
  title,
  onClose,
  children,
  width = 360,
  height = 500,
  right = 24,
  bottom = 80,
  backgroundColor = "#fff"
}) => {
  return (
    <div
      style={{
        position: "fixed",
        bottom: `${bottom}px`,
        right: `${right}px`,
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        backgroundColor: backgroundColor,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        zIndex: 10000,
        fontFamily: "sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: "#6ea9d7",
          color: "#fff",
          padding: "10px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: "bold",
          fontSize: "14px"
        }}
      >
        <span>{title}</span>
        <button
          style={{
            border: "none",
            background: "transparent",
            color: "#fff",
            fontSize: "18px",
            cursor: "pointer",
            lineHeight: "1",
          }}
          onClick={onClose}
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {children}
      </div>
    </div>
  );
};

export default PopupChatWrapper;
