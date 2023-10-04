import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

import { Layout, AddTodo, Item } from "./components";
import { Bindings } from "./bindings";
import { Todo } from "./model";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, title, completed FROM todo;`
  ).all<Todo>();
  const todos = results as unknown as Todo[]; // Currently, should fix a type mismatch.
  return c.html(
    <Layout>
      <AddTodo />
      {todos.map((todo) => {
        return <Item title={todo.title} id={todo.id} />;
      })}
      <div id="todo"></div>
    </Layout>
  );
});

app.post(
  "/todo",
  zValidator(
    "form",
    z.object({
      title: z.string().min(1),
    })
  ),
  async (c) => {
    const { title } = c.req.valid("form");
    const id = crypto.randomUUID();
    await c.env.DB.prepare(
      `INSERT INTO todo(id, completed, title) VALUES(?, ?, ?);`
    )
      .bind(id, 1, title)
      .run();
    return c.html(<Item title={title} id={id} />);
  }
);

app.delete("/todo/:id", async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare(`DELETE FROM todo WHERE id = ?;`).bind(id).run();
  c.status(200);
  return c.body(null);
});

export default app;
