import { Elysia } from "elysia";
import { likeRoutes } from "./routes";
import swagger from "@elysiajs/swagger";

const app = new Elysia();

app.group("", (app) => app.use(likeRoutes))
    .use(swagger())
    .listen(process.env.relationPORT || 3000);

console.log('Server us listening port ' + (process.env.relationPORT || 3000));
