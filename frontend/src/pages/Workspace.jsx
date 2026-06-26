import { useParams } from "react-router-dom";

import ModuleTree from "../components/project/ModuleTree";
import ArchitectureCanvas from "../components/architecture/ArchitectureCanvas";
import ChatPanel from "../components/chat/ChatPanel";

function Workspace() {
  const { id } = useParams();

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "300px 1fr 350px",
        height: "100vh",
      }}
    >
      <ModuleTree projectId={id} />

      <ArchitectureCanvas projectId={id} />

      <ChatPanel projectId={id} />
    </div>
  );
}

export default Workspace;