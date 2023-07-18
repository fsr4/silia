import fs from "fs";
import {defaultResource, getResourceServerInfo} from "./resource-indicators.js";
import {claims, findAccount} from "./account-data.js";

const jwks = JSON.parse(fs.readFileSync("jwks.json", { encoding: "utf-8" }));

const registrationToken = process.env.REGISTRATION_TOKEN;

if (!registrationToken) {
    console.log("Environment variable REGISTRATION_TOKEN is not set. Exiting...");
    process.exit(0);
}

const configuration = {
    extraClientMetadata: {
        properties: ["allowed_resources"]
    },
    features: {
        registration: {
            enabled: true,
            initialAccessToken: registrationToken
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

export default configuration;
