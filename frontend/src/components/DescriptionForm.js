import React, { useState } from "react";
import axios from "axios";

function DescriptionForm({ onResult }) {
  const [title, setTitle] = useState("");
  const [features, setFeatures] = useState("");
  const [tone, setTone] = useState("professional");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateDescriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/generate-description`, {
        title,
        features,
        tone,
      });
      if (res.data.descriptions) {
        onResult(res.data.descriptions);
      } else if (res.data.error) {
        setError(res.data.error);
      } else {
        setError("Unexpected server response.");
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || "Network error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="form">
      <input
        type="text"
        placeholder="Product Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Key Features"
        value={features}
        onChange={(e) => setFeatures(e.target.value)}
      />
      <select value={tone} onChange={(e) => setTone(e.target.value)}>
        <option value="professional">Professional</option>
        <option value="fun">Fun</option>
        <option value="friendly">Friendly</option>
      </select>
      <button onClick={generateDescriptions} disabled={loading}>
        {loading ? "Generating..." : "Generate Descriptions"}
      </button>
      {error && <p className="error">⚠️ {error}</p>}
    </div>
  );
}

export default DescriptionForm;