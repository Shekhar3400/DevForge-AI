import { useState } from "react";

function AddNodeModal({ onCreate }) {
  const [name, setName] = useState("");

  const handleCreate = () => {
    if (!name.trim()) return;

    onCreate(name);
    setName("");
  };

  return (
    <div
      style={{
        padding: "15px",
        borderTop: "1px solid #ddd",
      }}
    >
      <h4>Custom Component</h4>

      <input
        placeholder="Node Name"
        value={name}
        onChange={(e) =>
          setName(e.target.value)
        }
        style={{
          width: "100%",
          padding: "8px",
          marginBottom: "10px",
        }}
      />

      <button onClick={handleCreate}>
        Add Custom Node
      </button>
    </div>
  );
}

export default AddNodeModal;