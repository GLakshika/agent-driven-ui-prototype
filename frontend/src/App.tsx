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
                <div className="generated-ui" key={index}>
                  <div className="component-badge">
                    {component.component} COMPONENT
                  </div>

                  <h3>{component.ui.title}</h3>

                  <form>
                    {component.ui.fields.map((field) => (
                      <div className="form-field" key={field.name}>
                        <label>{field.label}</label>

                        {field.type === "select" ? (
                          <select>
                            <option value="">Select an option</option>
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                            <option value="PUT">PUT</option>
                            <option value="DELETE">DELETE</option>
                          </select>
                        ) : (
                          <input
                            type={field.type}
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                          />
                        )}
                      </div>
                    ))}
                  </form>

                  <button className="save-button">Save Configuration</button>
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