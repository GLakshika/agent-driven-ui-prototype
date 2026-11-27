import ballerina/http;

type GenerateRequest record {
    string prompt;
};

type UiField record {
    string name;
    string label;
    string 'type;
};

type UiSchema record {
    string title;
    UiField[] fields;
};

type ComponentResponse record {
    string component;
    UiSchema ui;
};

type GenerateResponse record {
    string message;
    ComponentResponse[] components;
};

listener http:Listener httpListener = new (8080);

service /api on httpListener {

    resource function post generate(GenerateRequest request) returns GenerateResponse {

        string prompt = request.prompt.toLowerAscii();

        ComponentResponse[] components = [];

        // HTTP component
        if prompt.includes("http") || prompt.includes("api") || prompt.includes("endpoint") {

            components.push({
                component: "HTTP",
                ui: {
                    title: "HTTP Request Configuration",
                    fields: [
                        {name: "method", label: "HTTP Method", 'type: "select"},
                        {name: "url", label: "Endpoint URL", 'type: "text"},
                        {name: "headers", label: "Headers", 'type: "text"}
                    ]
                }
            });
        }

        // Transformation component
        if prompt.includes("transform") || prompt.includes("convert") || prompt.includes("mapping") || prompt.includes("json") {

            components.push({
                component: "TRANSFORM",
                ui: {
                    title: "Data Transformation",
                    fields: [
                        {name: "source", label: "Source Data", 'type: "text"},
                        {name: "target", label: "Target Structure", 'type: "text"}
                    ]
                }
            });
        }

        // Database component
        if prompt.includes("database") || prompt.includes("postgres") || prompt.includes("sql") || prompt.includes("mysql") {

            components.push({
                component: "DATABASE",
                ui: {
                    title: "Database Configuration",
                    fields: [
                        {name: "host", label: "Database Host", 'type: "text"},
                        {name: "port", label: "Port", 'type: "number"},
                        {name: "database", label: "Database Name", 'type: "text"},
                        {name: "username", label: "Username", 'type: "text"}
                    ]
                }
            });
        }

        string message = components.length() > 0
            ? "Components selected successfully"
            : "No matching component found";

        return {
            message,
            components
        };
    }
        
}