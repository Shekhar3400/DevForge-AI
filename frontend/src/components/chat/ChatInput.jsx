import { useState } from "react";

function ChatInput() {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    console.log(message);
    setMessage("");
  };

  return (
    <div
      style={{
        padding: "10px",
        borderTop: "1px solid #ddd",
      }}
    >
      <input
        style={{
          width: "75%",
          padding: "10px",
        }}
        value={message}
        onChange={(e) =>
          setMessage(e.target.value)
        }
        placeholder="Ask DevForge AI..."
      />

      <button
        style={{
          marginLeft: "10px",
        }}
        onClick={handleSend}
      >
        Send
      </button>
    </div>
  );
}

export default ChatInput;