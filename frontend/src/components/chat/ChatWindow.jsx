function ChatWindow() {
  return (
    <div
      style={{
        flex: 1,
        padding: "15px",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          marginBottom: "15px",
        }}
      >
        <strong>User:</strong>

        <p>
          How should I implement JWT authentication?
        </p>
      </div>

      <div>
        <strong>AI:</strong>

        <p>
          Use Spring Security with JWT tokens,
          authentication filter and protected APIs.
        </p>
      </div>
    </div>
  );
}

export default ChatWindow;