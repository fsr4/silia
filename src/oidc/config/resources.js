export const authServerResource = {
    scope: 'api:read api:write',
    audience: 'auth-server',
    accessTokenTTL: 5 * 60, // 5 minutes
    accessTokenFormat: 'jwt',
    jwt: {
        sign: { alg: 'ES256' },
    }
};
