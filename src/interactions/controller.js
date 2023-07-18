import {strictEqual} from "assert";
import {authenticate} from "../ldap/index.js";
import userStore from "../user-store.js";

const scopeDescriptions = {
    "email": "eMail-Adresse",
    "major": "Studiengang",
};

export default function (provider) {
    async function authorize(ctx, next) {
        try {
            const details = await provider.interactionDetails(ctx.req, ctx.res);
            console.log('see what else is available to you for interaction views', details);
            const {
                uid, prompt, params,
            } = details;

            const client = await provider.Client.find(params.client_id);

            console.log(client);

            if (prompt.name === 'login') {
                return ctx.render('login', {
                    client,
                    uid,
                    details: prompt.details,
                    params,
                    flash: undefined,
                });
            }

            return ctx.render('interaction', {
                client,
                uid,
                details: prompt.details,
                params,
                scopeDescriptions,
            });
        } catch (err) {
            return await next(err);
        }
    }

    async function login(ctx, next) {
        try {
            const {uid, prompt, params} = await provider.interactionDetails(ctx.req, ctx.res);
            strictEqual(prompt.name, 'login');
            const client = await provider.Client.find(params.client_id);

            let accountId;
            let errorMessage;

            try {
                const username = ctx.request.body.email.split("@htw-berlin.de")[0];
                const user = await authenticate(username, ctx.request.body.password);
                accountId = user.uid;
                userStore.storeUserinfo(accountId, user);
            } catch (error) {
                if (error.name === "InvalidCredentialsError") {
                    errorMessage = "Invalid email or password.";
                } else if (error.name === "Error" && error.code === "ETIMEDOUT") {
                    errorMessage = "LDAP server connection timed out";
                } else {
                    errorMessage = "Unknown LDAP server error. Please contact an administrator about this.";
                    console.error("Login error occurred:", error);
                }
            }

            if (!accountId) {
                return ctx.render('login', {
                    client,
                    uid,
                    details: prompt.details,
                    params: {
                        ...params,
                        login_hint: ctx.request.body.email,
                    },
                    flash: errorMessage,
                });
            }

            const result = {
                login: {accountId},
            };

            await provider.interactionFinished(ctx.req, ctx.res, result, {mergeWithLastSubmission: false});
        } catch (err) {
            await next(err);
        }
    }

    async function confirm(ctx, next) {
        try {
            const interactionDetails = await provider.interactionDetails(ctx.req, ctx.res);
            const {prompt: {name, details}, params, session: {accountId}} = interactionDetails;
            strictEqual(name, 'consent');

            let {grantId} = interactionDetails;
            let grant;

            if (grantId) {
                // we'll be modifying existing grant in existing session
                grant = await provider.Grant.find(grantId);
            } else {
                // we're establishing a new grant
                grant = new provider.Grant({
                    accountId,
                    clientId: params.client_id,
                });
            }

            if (details.missingOIDCScope) {
                grant.addOIDCScope(details.missingOIDCScope.join(' '));
                // use grant.rejectOIDCScope to reject a subset or the whole thing
            }
            if (details.missingOIDCClaims) {
                grant.addOIDCClaims(details.missingOIDCClaims);
                // use grant.rejectOIDCClaims to reject a subset or the whole thing
            }
            if (details.missingResourceScopes) {
                // eslint-disable-next-line no-restricted-syntax
                for (const [indicator, scopes] of Object.entries(details.missingResourceScopes)) {
                    grant.addResourceScope(indicator, scopes.join(' '));
                    // use grant.rejectResourceScope to reject a subset or the whole thing
                }
            }

            grantId = await grant.save();

            const consent = {};
            if (!interactionDetails.grantId) {
                // we don't have to pass grantId to consent, we're just modifying existing one
                consent.grantId = grantId;
            }

            const result = {consent};
            await provider.interactionFinished(ctx.req, ctx.res, result, {mergeWithLastSubmission: true});
        } catch (err) {
            await next(err);
        }
    }

    async function abort(ctx, next) {
        try {
            const result = {
                error: 'access_denied',
                error_description: 'End-User aborted interaction',
            };
            await provider.interactionFinished(ctx.req, ctx.res, result, {mergeWithLastSubmission: false});
        } catch (err) {
            await next(err);
        }
    }

    return {
        authorize,
        login,
        confirm,
        abort,
    };
}
