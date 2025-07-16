import React, { useState } from "react";
import "./App.css";
import Header from "./components/Header";
import DescriptionForm from "./components/DescriptionForm";
import DescriptionResults from "./components/DescriptionResults";
import Footer from "./components/Footer";

function App() {
  const [descriptions, setDescriptions] = useState([]);

  return (
    <div className="App">
      <Header />
      <main className="main-content">
        <DescriptionForm onResult={setDescriptions} />
        <DescriptionResults descriptions={descriptions} />
      </main>
      <Footer />
    </div>
  );
}

export default App;
