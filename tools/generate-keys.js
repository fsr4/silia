import fs from "fs/promises";
import path from "path";
import { generateKeyPair, exportJWK } from "jose";

(async () => {
    const rsa = await generateKeyPair("RS256");
    const ec = await generateKeyPair("ES256");
    const okp = await generateKeyPair("EdDSA", { crv: "Ed25519" });

    const keys = [];
    keys.push(await exportJWK(rsa.privateKey));
    keys.push(await exportJWK(ec.privateKey));
    keys.push(await exportJWK(okp.privateKey));

    await fs.writeFile("jwks.json", JSON.stringify({ keys: keys }));
})();
