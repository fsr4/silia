import KoaRouter from "@koa/router";
import {noCache} from "../utils.js";
import createInteractions from "./controller.js";
import bodyParser from "koa-bodyparser";

export default class Router extends KoaRouter {
    constructor(provider) {
        super();

        const parse = bodyParser();
        const interactions = createInteractions(provider);

        this.get('/interaction/:uid', noCache, interactions.authorize);
        this.post('/interaction/:uid/login', noCache, parse, interactions.login);
        this.post('/interaction/:uid/confirm', noCache, parse, interactions.confirm);
        this.get('/interaction/:uid/abort', noCache, interactions.abort);
    }
}
