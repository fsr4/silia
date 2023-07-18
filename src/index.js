import "dotenv/config";
import Koa from "koa";
import views from "@ladjs/koa-views";
import serve from "koa-static";
import InteractionsRouter from "./interactions/index.js";
import {koaAdapter} from "./utils.js";
import {Provider} from "oidc-provider";
import configuration from "./oidc/index.js";
import mongoAdapter from "./oidc/mongo-adapter.js";

const host = process.env.HOST || "http://localhost";
const port = parseInt(process.env.PORT) || 9999;

const app = new Koa();

// Setup HTML template rendering engine
const render = views("views", {
    extension: "ejs",
    options: {

    }
});
app.use(render);

app.use(serve("static"));

// Set up and start OIDC Provider
(async () => {
    // Connect to database
    await mongoAdapter.connect();

    const provider = new Provider(`${host}:${port}`, {adapter: mongoAdapter, ...configuration});

    // Mount interaction routes
    app.use(new InteractionsRouter(provider).routes());

    // Mount oidc provider
    app.use(koaAdapter(provider.callback()));

    app.listen(port, () => console.log(`Listening on port ${port}...`));
})();
