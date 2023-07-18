export function koaAdapter(reqResMiddleware) {
    return (ctx) => reqResMiddleware(ctx.req, ctx.res);
}

export async function noCache(ctx, next) {
    ctx.response.set("Pragma", "no-cache");
    ctx.response.set("Cache-Control", "no-cache, no-store");
    await next();
}

export function ldapDateToJSDate(ldapDate) {
    const chars = ldapDate.substr(0, 14).split("");
    chars.splice(4, 0, "-");
    chars.splice(7, 0, "-");
    chars.splice(10, 0, " ");
    chars.splice(13, 0, ":");
    chars.splice(16, 0, ":");
    return new Date(chars.join(""));
}

export function ldapGroupsToMajor(ldapGroups) {
    for (const groupString of ldapGroups) {
        const groupMatches = groupString.match(/=GP-F4-(.+-[BM])-STUD/);
        if (groupMatches.length !== 2)
            continue;
        return groupMatches[1];
    }
    console.log(`Unsupported group encountered: ${JSON.stringify(ldapGroups)}`);
    return null;
}
