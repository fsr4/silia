import "dotenv/config";
import Koa from "koa";
import views from "koa-views";
import interactions from "./interactions/index.js";
import {koaAdapter} from "./utils.js";
import oidc from "./oidc/index.js";

const app = new Koa();

// Setup HTML template rendering engine
const render = views("views", {
    extension: "ejs"
});
app.use(render);

// Mount interaction routes
app.use(interactions);

// Mount oidc provider
app.use(koaAdapter(oidc.callback()));

app.listen(9999, () => console.log("Listening on port 9999..."));
