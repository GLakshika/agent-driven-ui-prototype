import { useState } from "react";
import "./App.css";

interface UiField {
  name: string;
  label: string;
  type: string;
}

interface ComponentResponse {
  component: string;
  ui: {
    title: string;
    fields: UiField[];
  };
}

interface GenerateResponse {
  message: string;
  components: ComponentResponse[];
}

function App() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [configurations, setConfigurations] = useState<Record<string, Record<string, string>>>({});
  const [savedComponents, setSavedComponents] = useState<Record<string, boolean>>({});
  const [savedData, setSavedData] = useState<Record<string, Record<string, string>>>({});
  const [workflowPrompt, setWorkflowPrompt] = useState("");

  const handleSaveConfiguration = (componentName: string) => {
    setSavedData((prev) => ({
      ...prev,
      [componentName]: { ...configurations[componentName] },
    }));

    setSavedComponents((prev) => ({
      ...prev,
      [componentName]: true,
    }));
  };

  const handleFieldChange = (
    componentName: string,
    fieldName: string,
    value: string
  ) => {
    setConfigurations((prev) => ({
      ...prev,
      [componentName]: {
        ...prev[componentName],
        [fieldName]: value,
      },
    }));
  };

  const handleRemoveComponent = (componentName: string) => {
    setResult((prev) =>
      prev
        ? {
            ...prev,
            components: prev.components.filter(
              (component) => component.component !== componentName
            ),
          }
        : prev
    );

    setConfigurations((prev) => {
      const updated = { ...prev };
      delete updated[componentName];
      return updated;
    });

    setSavedComponents((prev) => {
      const updated = { ...prev };
      delete updated[componentName];
      return updated;
    });

    setSavedData((prev) => {
      const updated = { ...prev };
      delete updated[componentName];
      return updated;
    });
  };

  async function generateUI() {
    if (!prompt.trim()) return;

    setLoading(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: prompt.toLowerCase().trim() }),
      });

      const data: GenerateResponse = await response.json();
      setResult(data);
      setWorkflowPrompt(prompt);
    } catch (error) {
      alert("Could not connect to Ballerina backend.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Integration Workspace</h1>
        <span className="status">Prototype</span>
      </header>

      <div className="workspace">
        <section className="chat-panel">
          <h2>Integration Assistant</h2>

          <p className="description">
            Describe the integration component you want to configure.
          </p>

          <div className="examples">
            <p>Try:</p>
            <button onClick={() => setPrompt("http")}>HTTP</button>
            <button onClick={() => setPrompt("database")}>Database</button>
            <button onClick={() => setPrompt("transform")}>Transform</button>
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to build..."
          />

          <button className="generate-button" onClick={generateUI}>
            {loading ? "Generating..." : "Generate UI"}
          </button>
        </section>

        <section className="canvas-panel">
          <h2>Workspace</h2>
          {result && result.components.length > 0 && (
            <div className="workflow-header">
              <h3>Generated Integration Workflow</h3>
              <p>{workflowPrompt}</p>
            </div>
          )}

          {!result || result.components.length === 0 ? (
            <div className="empty-state">
              <h3>Your workspace is empty</h3>
              <p>
                {result?.message ||
                  "Enter a request in the assistant to generate a configuration UI."}
              </p>
            </div>
          ) : (
            <div className="component-container">
            
              {result.components.map((component, index) => (
                <div className="flow-step" key={index}>
                  <div className="generated-ui">
                    <div className="component-badge">
                      {component.component} COMPONENT
                    </div>

                    <h3>{component.ui.title}</h3>
                    <button
                      className="remove-button"
                      onClick={() => handleRemoveComponent(component.component)}
                    >
                      Remove Component
                    </button>

                    <form>
                      {component.ui.fields.map((field) => (
                        <div className="form-field" key={field.name}>
                          <label>{field.label}</label>

                          {field.type === "select" ? (
                            <select
                              value={configurations[component.component]?.[field.name] || ""}
                              onChange={(e) =>
                                handleFieldChange(
                                  component.component,
                                  field.name,
                                  e.target.value
                                )
                              }
                            >
                              <option value="">Select an option</option>
                              <option value="GET">GET</option>
                              <option value="POST">POST</option>
                              <option value="PUT">PUT</option>
                              <option value="DELETE">DELETE</option>
                            </select>
                          ) : (
                            <input
                              type={field.type}
                              value={configurations[component.component]?.[field.name] || ""}
                              placeholder={`Enter ${field.label.toLowerCase()}`}
                              onChange={(e) =>
                                handleFieldChange(
                                  component.component,
                                  field.name,
                                  e.target.value
                                )
                              }
                            />
                          )}
                        </div>
                      ))}
                    </form>

                    <button
                      className="save-button"
                      onClick={() => handleSaveConfiguration(component.component)}
                    >
                      Save Configuration
                    </button>

                    {savedComponents[component.component] && (
                      <div className="saved-summary">
                        <p className="saved-message">Configuration Saved</p>
                        <h4>Saved Details</h4>

                        {Object.entries(savedData[component.component] || {}).map(
                          ([key, value]) => (
                            <div className="saved-item" key={key}>
                              <strong>{key}:</strong> {value || "Not entered"}
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>

              {index < result.components.length - 1 && (
                <div className="flow-connector">
                  <span>↓</span>
                </div>
                )}
              </div>
              ))}
            </div>       
            
          )}
        </section> 
      </div>
    </div>
  );
}

export default App;