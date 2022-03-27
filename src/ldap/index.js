import LdapAuth from "ldapauth-fork";
import {getLDAPOptions} from "./config.js";

LdapAuth.prototype.authenticateAsync = async function(username, password) {
    return new Promise((resolve, reject) => {
        this.authenticate(username, password, (error, user) => {
            if (error)
                return reject(error);
            return resolve(user);
        });
    });
}

LdapAuth.prototype.closeAsync = async function() {
    return new Promise((resolve, reject) => this.close(error => {
        if (error)
            return reject(error);
        return resolve();
    }));
}

export async function authenticate(username, password) {
    return new Promise(async (resolve, reject) => {
        const ldap = new LdapAuth(getLDAPOptions(username, password));

        ldap.on("error", error => reject(error));

        try {
            const user = await ldap.authenticateAsync(username, password);
            await ldap.closeAsync();
            return resolve(user);
        } catch (error) {
            return reject(error);
        }
    });
}
