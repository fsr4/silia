export const testClient = {
    client_id: "test",
    client_secret: "12345",
    redirect_uris: [
        "http://localhost:3000/login",
        "http://localhost:3000/callback"
    ],
    response_types: ["code"],
    allowedResources: ["http://localhost:9999"]
};
