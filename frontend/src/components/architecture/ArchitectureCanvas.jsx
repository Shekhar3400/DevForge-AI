import { useEffect, useState } from "react";

import ReactFlow, {
  Background,
  Controls,
  MiniMap,
} from "reactflow";

import "reactflow/dist/style.css";

import NodePalette from "./NodePalette";
import AddNodeModal from "./AddNodeModal";

import {
  getNodes,
  createNode,
} from "../../api/nodeApi";

import {
  getEdges,
} from "../../api/edgeApi";

function ArchitectureCanvas() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const ARCHITECTURE_ID = 1;

  useEffect(() => {
    loadArchitecture();
  }, []);

  const loadArchitecture = async () => {
    try {
      const backendNodes =
        await getNodes(ARCHITECTURE_ID);

      const backendEdges =
        await getEdges(ARCHITECTURE_ID);

      const flowNodes =
        backendNodes.map((node) => ({
          id: node.nodeKey,
          position: {
            x: node.positionX,
            y: node.positionY,
          },
          data: {
            label: node.label,
          },
        }));

      const flowEdges =
        backendEdges.map((edge) => ({
          id: edge.edgeKey,
          source: edge.sourceNode,
          target: edge.targetNode,
        }));

      setNodes(flowNodes);
      setEdges(flowEdges);

    } catch (error) {
      console.error(error);
    }
  };

  const handleAddNode = async (
    componentName
  ) => {
    try {
      await createNode({
        nodeKey:
          componentName
            .toLowerCase()
            .replaceAll(" ", "-")
            + Date.now(),

        label: componentName,

        type: "default",

        positionX:
          Math.random() * 500,

        positionY:
          Math.random() * 300,

        architectureId:
          ARCHITECTURE_ID,
      });

      loadArchitecture();

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "220px 1fr",
        height: "100%",
      }}
    >
      <div
        style={{
          borderRight:
            "1px solid #ddd",
        }}
      >
        <NodePalette
          onAddNode={
            handleAddNode
          }
        />

        <AddNodeModal
          onCreate={
            handleAddNode
          }
        />
      </div>

      <div
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </div>
  );
}

export default ArchitectureCanvas;