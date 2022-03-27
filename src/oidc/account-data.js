import userStore from "../user-store.js";
import {ldapDateToJSDate, ldapGroupsToMajor} from "../utils.js";

export const claims = {
    email: ["email", "email_verified"],
    profile: [
        "name", "family_name", "given_name", "middle_name", "nickname", "preferred_username",
        // "profile", "picture", "website", "gender", "birthdate", "zoneinfo", "locale",
        "updated_at"
    ],
    major: ["major"]
};

export async function findAccount(ctx, id) {
    // Check if user exists in store
    if (!userStore.hasUserinfo(id))
        return undefined;

    return {
        accountId: id,
        async claims(use, scope, claims, rejected) {
            const user = userStore.getUserinfo(id);

            console.log("use:", use, "\nscope:", scope, "\nclaims:", claims, "\nrejected:", rejected);
            console.log(user);

            return {
                sub: id,
                email: user.mail,
                email_verified: true,
                name: `${user.givenName} ${user.sn}`,
                family_name: user.sn,
                given_name: user.givenName.split(" ")[0],
                middle_name: user.givenName.split(" ").slice(1).join(" "),
                nickname: user.givenName,
                preferred_username: user.uid,
                // profile: null,
                // picture: null,
                // website: null,
                // gender: null,
                // birthdate: null,
                // zoneinfo: null,
                // locale: null,
                updated_at: ldapDateToJSDate(user.whenChanged),
                major: ldapGroupsToMajor(user.memberOf)
            };
        },
    };
}
