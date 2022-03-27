import Router from "@koa/router";
import {noCache} from "../utils.js";
import Interactions from "./controller.js";
import bodyParser from "koa-bodyparser";

const router = new Router();

const parse = bodyParser();

router.get('/interaction/:uid', noCache, Interactions.authorize);
router.post('/interaction/:uid/login', noCache, parse, Interactions.login);
router.post('/interaction/:uid/confirm', noCache, parse, Interactions.confirm);
router.get('/interaction/:uid/abort', noCache, Interactions.abort);

export default router;
