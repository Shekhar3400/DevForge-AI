import ChatHistory from "./ChatHistory";
import ChatWindow from "./ChatWindow";
import ChatInput from "./ChatInput";

function ChatPanel() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div
        style={{
          padding: "15px",
          borderBottom: "1px solid #ddd",
        }}
      >
        <h2>AI Assistant</h2>
      </div>

      <ChatHistory />

      <ChatWindow />

      <ChatInput />
    </div>
  );
}

export default ChatPanel;