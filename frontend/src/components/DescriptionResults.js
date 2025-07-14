import React from "react";

function DescriptionResults({ descriptions }) {
  if (!descriptions.length) return null;

  return (
    <div className="results">
      <h3>Generated Descriptions:</h3>
      <ul>
        {descriptions.map((desc, index) => (
          <li key={index}>{desc}</li>
        ))}
      </ul>
    </div>
  );
}

export default DescriptionResults;
