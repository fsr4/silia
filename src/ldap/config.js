import {readFileSync} from "fs";

export function getLDAPOptions(username, password) {
    return {
        // TODO: Extract HTW LDAP information
        url: process.env.LDAP_URL,
        bindDN: `CN=${username},${process.env.LDAP_SEARCH_BASE}`,
        bindCredentials: password,
        searchBase: process.env.LDAP_SEARCH_BASE,
        searchFilter: "(uid={{username}})",
        tlsOptions: {
            ca: [readFileSync("certs/CA-HTW-cert.pem")],
        }
    };
}
