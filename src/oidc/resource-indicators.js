import {OIDCProviderError} from "oidc-provider/lib/helpers/errors.js";
import {errors} from "oidc-provider";
import {authServerResource} from "./config/resources.js";

const resourceServers = new Map();
const defaultResourceServer = "http://localhost:9999";
resourceServers.set(defaultResourceServer, authServerResource);

class InvalidResourceIndicator extends OIDCProviderError {
    constructor() {
        super(403, 'invalid_resource_indicator');
        Error.captureStackTrace(this, this.constructor);
        this.error_description = "client is not allowed to access this resource server";
    }
}

export function getResourceServerInfo(ctx, resourceIndicator, client) {
    if (!resourceServers.has(resourceIndicator))
        throw new errors.InvalidTarget();

    if (client.allowedResources.indexOf(resourceIndicator) === -1)
        throw new InvalidResourceIndicator();

    return resourceServers.get(resourceIndicator);
}

export function defaultResource(ctx, client, oneOf) {
    if (oneOf)
        return oneOf[0];
    return defaultResourceServer;
}
