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

type GenerateResponse record {
    string message;
    string component;
    UiSchema ui;
};

listener http:Listener httpListener = new (8080);

service /api on httpListener {

    resource function post generate(GenerateRequest request) returns GenerateResponse {

        string prompt = request.prompt;

        if prompt == "http" {

            return {
                message: "HTTP component selected",
                component: "HTTP",
                ui: {
                    title: "HTTP Request Configuration",
                    fields: [
                        {name: "method", label: "HTTP Method", 'type: "select"},
                        {name: "url", label: "Endpoint URL", 'type: "text"},
                        {name: "headers", label: "Headers", 'type: "text"}
                    ]
                }
            };

        } else if prompt == "database" {

            return {
                message: "Database component selected",
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
            };

        } else if prompt == "transform" {

            return {
                message: "Transformation component selected",
                component: "TRANSFORM",
                ui: {
                    title: "Data Transformation",
                    fields: [
                        {name: "source", label: "Source Data", 'type: "text"},
                        {name: "target", label: "Target Structure", 'type: "text"}
                    ]
                }
            };

        } else {

            return {
                message: "No matching component found",
                component: "NONE",
                ui: {
                    title: "",
                    fields: []
                }
            };
        }
    }
}
