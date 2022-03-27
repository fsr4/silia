import oidc from "../oidc/index.js";
import {strictEqual} from "assert";
import {authenticate} from "../ldap/index.js";
import userStore from "../user-store.js";

async function authorize(ctx, next) {
    try {
        const details = await oidc.interactionDetails(ctx.req, ctx.res);
        console.log('see what else is available to you for interaction views', details);
        const {
            uid, prompt, params,
        } = details;

        const client = await oidc.Client.find(params.client_id);

        if (prompt.name === 'login') {
            return ctx.render('login', {
                client,
                uid,
                details: prompt.details,
                params,
                title: 'Sign-in',
                flash: undefined,
            });
        }

        return ctx.render('interaction', {
            client,
            uid,
            details: prompt.details,
            params,
            title: 'Authorize',
        });
    } catch (err) {
        return await next(err);
    }
}

async function login(ctx, next) {
    try {
        const {uid, prompt, params} = await oidc.interactionDetails(ctx.req, ctx.res);
        strictEqual(prompt.name, 'login');
        const client = await oidc.Client.find(params.client_id);

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
                title: 'Sign-in',
                flash: errorMessage,
            });
        }

        const result = {
            login: {accountId},
        };

        await oidc.interactionFinished(ctx.req, ctx.res, result, {mergeWithLastSubmission: false});
    } catch (err) {
        await next(err);
    }
}

async function confirm(ctx, next) {
    try {
        const interactionDetails = await oidc.interactionDetails(ctx.req, ctx.res);
        const {prompt: {name, details}, params, session: {accountId}} = interactionDetails;
        strictEqual(name, 'consent');

        let {grantId} = interactionDetails;
        let grant;

        if (grantId) {
            // we'll be modifying existing grant in existing session
            grant = await oidc.Grant.find(grantId);
        } else {
            // we're establishing a new grant
            grant = new oidc.Grant({
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
        await oidc.interactionFinished(ctx.req, ctx.res, result, {mergeWithLastSubmission: true});
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
        await oidc.interactionFinished(ctx.req, ctx.res, result, {mergeWithLastSubmission: false});
    } catch (err) {
        await next(err);
    }
}

const Interactions = {
    authorize,
    login,
    confirm,
    abort
};

export default Interactions;
