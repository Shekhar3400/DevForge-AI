import { useEffect, useState } from "react";

import {
  getModules,
  createModule,
} from "../../api/moduleApi";

import {
  getFeatures,
  createFeature,
} from "../../api/featureApi";

import FeatureList from "./FeatureList";

function ModuleTree({ projectId }) {
  const [modules, setModules] = useState([]);
  const [featuresMap, setFeaturesMap] = useState({});

  const [moduleName, setModuleName] =
    useState("");

  const [featureInputs, setFeatureInputs] =
    useState({});

  const loadModules = async () => {
    const moduleData =
      await getModules(projectId);

    setModules(moduleData);

    const featureMap = {};

    for (const module of moduleData) {
      const features =
        await getFeatures(module.id);

      featureMap[module.id] = features;
    }

    setFeaturesMap(featureMap);
  };

  useEffect(() => {
    if (projectId) {
      loadModules();
    }
  }, [projectId]);

  const handleCreateModule =
    async () => {
      if (!moduleName.trim()) return;

      await createModule({
        name: moduleName,
        projectId: Number(projectId),
      });

      setModuleName("");

      loadModules();
    };

  const handleCreateFeature =
    async (moduleId) => {
      const name =
        featureInputs[moduleId];

      if (!name?.trim()) return;

      await createFeature({
        name,
        description: "",
        moduleId,
      });

      setFeatureInputs({
        ...featureInputs,
        [moduleId]: "",
      });

      loadModules();
    };

  return (
    <div
      style={{
        padding: "20px",
      }}
    >
      <h2>System Design</h2>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <input
          value={moduleName}
          placeholder="Module Name"
          onChange={(e) =>
            setModuleName(e.target.value)
          }
        />

        <button
          onClick={handleCreateModule}
        >
          Add
        </button>
      </div>

      {modules.map((module) => (
        <div
          key={module.id}
          style={{
            border: "1px solid #444",
            borderRadius: "10px",
            padding: "15px",
            marginBottom: "15px",
          }}
        >
          <h3>{module.name}</h3>

          <FeatureList
            features={
              featuresMap[module.id]
            }
          />

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "10px",
            }}
          >
            <input
              placeholder="Feature Name"
              value={
                featureInputs[module.id] ||
                ""
              }
              onChange={(e) =>
                setFeatureInputs({
                  ...featureInputs,
                  [module.id]:
                    e.target.value,
                })
              }
            />

            <button
              onClick={() =>
                handleCreateFeature(
                  module.id
                )
              }
            >
              Add Feature
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ModuleTree;