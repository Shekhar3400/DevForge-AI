function NodePalette({ onAddNode }) {
  const components = [
    "Frontend",
    "Backend",
    "Database",
    "Redis",
    "Kafka",
    "API Gateway",
    "Auth Service",
    "Notification Service",
    "Payment Service",
  ];

  return (
    <div
      style={{
        padding: "15px",
        borderBottom: "1px solid #ddd",
      }}
    >
      <h3>Components</h3>

      {components.map((component) => (
        <button
          key={component}
          onClick={() => onAddNode(component)}
          style={{
            display: "block",
            width: "100%",
            marginBottom: "8px",
            padding: "8px",
          }}
        >
          + {component}
        </button>
      ))}
    </div>
  );
}

export default NodePalette;