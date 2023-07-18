# HTW SSO
This is an SSO service based on OIDC which connects to an LDAP server for authenticating users.

## Setup
1. Copy the `.env.sample` file, save it as `.env` and fill in the necessary environment variables.
2. Generate a JsonWebKeys file by running
```shell
npm run generate-keys
```
3. Run
```shell
docker compose up -d
```
to start the OIDC SSO service and its accompanying database.

If you want to start a development environment with hot reloading and an open debug port, run
```shell
docker compose -f docker-compose.yml -f docker-compose.local.yml up -d --build
```
instead.

## Registering clients
New clients can be added via the `POST /reg` endpoint. To access this endpoint you need to pass the initial access token (set in the environment variable `REGISTRATION_TOKEN`) as Bearer token in the Authorization header.

**Make sure to save the client id, client secret and access token returned by the API!** These values won't be shown again. You'll need the client id and secret to connect your service to the SSO service and you'll need the access token if you want to modify your service registration later on. 

### Example client configuration
```json
{
  "client_name": "Klausurensammlung",
  "logo_uri": "http://localhost:8000/logo.png",
  "redirect_uris": [
    "http://localhost:8000/oidc/callback"
  ],
  "post_logout_redirect_uris": [
    "http://localhost:8000/oidc/callback",
    "http://localhost:8000/oidc/logout_by_op"
  ],
  "allowed_resources": ["http://localhost:9999"]
}
```
