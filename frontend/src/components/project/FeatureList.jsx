function FeatureList({ features }) {
  if (!features || features.length === 0) {
    return (
      <div
        style={{
          color: "#888",
          marginTop: "10px",
        }}
      >
        No Features
      </div>
    );
  }

  return (
    <ul
      style={{
        marginTop: "10px",
      }}
    >
      {features.map((feature) => (
        <li key={feature.id}>
          {feature.name}
        </li>
      ))}
    </ul>
  );
}

export default FeatureList;