import {Provider} from "oidc-provider";
import fs from "fs";
import {testClient} from "./config/clients.js";
import {defaultResource, getResourceServerInfo} from "./resource-indicators.js";
import {claims, findAccount} from "./account-data.js";

const jwks = JSON.parse(fs.readFileSync("jwks.json", { encoding: "utf-8" }));

const configuration = {
    clients: [testClient],
    extraClientMetadata: {
        properties: ["allowedResources"]
    },
    features: {
        registration: {
            enabled: true
        },
        devInteractions: {
            enabled: false
        },
        resourceIndicators: {
            getResourceServerInfo,
            defaultResource,
            useGrantedResource: () => true
        }
    },
    cookies: {
        keys: ["TEST_KEY__REPLACE_ME"]
    },
    interactions: {
        url(ctx, interaction) {
            return `/interaction/${interaction.uid}`;
        },
    },
    findAccount,
    jwks,
    claims: claims
};

const provider = new Provider("http://localhost:9999", configuration);

export default provider;
