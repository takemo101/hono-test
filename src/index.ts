import { Hono } from "hono";
import { basicAuth } from 'hono/basic-auth'
import { todos } from "./api-kv";
import { Bindings } from "./bindings";

const app = new Hono<{ Bindings: Bindings }>();

app.use(
  "/api/*",
  async (c, next) => {
    const auth = basicAuth({
      username: c.env.BASIC_AUTH_USERNAME,
      password: c.env.BASIC_AUTH_PASSWORD,
    });
    console.log(c.env.BASIC_AUTH_USERNAME);
    await auth(c, next);
  }
);

app.route('/api/todos', todos);

export default app;
