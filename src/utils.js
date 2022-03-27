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

const groupMap = {
    "F4-IMI-B-STUD": "IMI-B",
    "F4-IMI-M-STUD": "IMI-M",
};

const groupStartIndicator = "F4";
const groupEndIndicator = "STUD";

export function ldapGroupsToMajor(ldapGroups) {
    for (const groupString of ldapGroups) {
        const groupStartIndex = groupString.indexOf(groupStartIndicator);
        const group = groupString.substr(
            groupStartIndex,
            groupString.indexOf(groupEndIndicator) + groupEndIndicator.length - groupStartIndex
        );
        const mappedGroup = groupMap[group];
        if (mappedGroup) return mappedGroup;
    }
    return null;
}
