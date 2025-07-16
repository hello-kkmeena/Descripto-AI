import React, { useState } from "react";
import "./App.css";
import Header from "./components/Header";
import DescriptionForm from "./components/DescriptionForm";
import DescriptionResults from "./components/DescriptionResults";
import Footer from "./components/Footer";
import ErrorBoundary from "./components/ErrorBoundary";
import axios from "axios";
import { getEndpointUrl } from "./config/api";

function App() {
  const [descriptions, setDescriptions] = useState([]);
  const [lastFormData, setLastFormData] = useState(null);
  const [nextId, setNextId] = useState(1);

  const handleResult = (newDescriptions, formData) => {
    // Create description objects with metadata
    const descriptionObjects = newDescriptions.map(description => ({
      id: nextId,
      title: formData.title,
      features: formData.features,
      tone: formData.tone,
      type: 'fresh',
      content: description,
      timestamp: new Date().toISOString()
    }));

    console.log("New descriptions with metadata:", descriptionObjects);
    console.log("Form data:", formData);

    setDescriptions(prev => [...prev, ...descriptionObjects]);
    setNextId(prev => prev + 1);
  };

  const handleRegenerate = async (id = null) => {
    console.log("Regenerating index: " + id);
    
    if (id === null) {
      // Reset all - clear all descriptions
      setDescriptions([]);
      setNextId(1);
      return;
    }

    // Find the description to regenerate
    const descriptionToRegenerate = descriptions.find(desc => desc.id === id);
    if (!descriptionToRegenerate) {
      console.error("Description with id " + id + " not found");
      return;
    }

    console.log("Regenerating description:", descriptionToRegenerate);

    try {
      // Call API with the same parameters
      const formData = {
        title: descriptionToRegenerate.title,
        features: descriptionToRegenerate.features,
        tone: descriptionToRegenerate.tone
      };

      console.log("Calling API with form data:", formData);

      const res = await axios.post(getEndpointUrl('GENERATE_DESCRIPTION'), formData);
      
      if (res.data.descriptions && res.data.descriptions.length > 0) {
        // Replace the old description with the new one
        const newDescription = {
          id: id, // Keep the same ID
          title: descriptionToRegenerate.title,
          features: descriptionToRegenerate.features,
          tone: descriptionToRegenerate.tone,
          type: 'regenerate',
          content: res.data.descriptions[0], // Take the first description
          timestamp: new Date().toISOString()
        };

        console.log("New regenerated description:", newDescription);

        setDescriptions(prev => 
          prev.map(desc => 
            desc.id === id ? newDescription : desc
          )
        );
      }
    } catch (err) {
      console.error("API Error during regeneration:", err);
      // You might want to show an error message to the user here
    }
  };

  const handleDelete = (id) => {
    console.log("Deleting description with id: " + id);
    setDescriptions(prev => prev.filter(desc => desc.id !== id));
  };

  return (
    <ErrorBoundary>
      <div className="App">
        <Header />
        <main className="main-content">
          <div className={`content-layout ${descriptions.length > 0 ? 'has-results' : 'no-results'}`}>
            <div className="form-section">
              <DescriptionForm 
                onResult={handleResult} 
                onFormDataChange={setLastFormData}
              />
            </div>
            {descriptions.length > 0 && (
              <div className="results-section">
                <DescriptionResults 
                  descriptions={descriptions.map(desc => desc.content).reverse()} 
                  onRegenerate={handleRegenerate}
                  onDelete={handleDelete}
                  descriptionMetadata={descriptions.slice().reverse()}
                />
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

export default App;
