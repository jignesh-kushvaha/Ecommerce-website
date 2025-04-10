import React, { createContext, useContext } from "react";
import { message } from "antd";

const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
  const [messageApi, contextHolder] = message.useMessage();

  const showMessage = (type, content, duration = 3) => {
    messageApi.open({
      type,
      content,
      duration,
    });
  };

  const success = (content, duration) =>
    showMessage("success", content, duration);
  const error = (content, duration) => showMessage("error", content, duration);
  const warning = (content, duration) =>
    showMessage("warning", content, duration);
  const info = (content, duration) => showMessage("info", content, duration);

  return (
    <MessageContext.Provider value={{ success, error, warning, info }}>
      {contextHolder}
      {children}
    </MessageContext.Provider>
  );
};

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("useMessage must be used within a MessageProvider");
  }
  return context;
};

export default MessageContext;
