import React, { useState } from "react";
import "./App.css";
import DescriptionForm from "./components/DescriptionForm";
import DescriptionResults from "./components/DescriptionResults";

function App() {
  const [descriptions, setDescriptions] = useState([]);

  return (
    <div className="App">
      <h1>AI eBay Product Description Generator</h1>
      <DescriptionForm onResult={setDescriptions} />
      <DescriptionResults descriptions={descriptions} />
    </div>
  );
}

export default App;
