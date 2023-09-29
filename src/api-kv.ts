import { Hono } from "hono";
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { Bindings } from "./bindings";
import { CreateTodo, createTodo, deleteTodo, getTodo, getTodos, updateTodo } from "./model";

const todos = new Hono<{ Bindings: Bindings }>();

todos.get("/", async (c) => {
  const todos = await getTodos(c.env.HONO_TODO);
  return c.json(todos);
});

todos.post(
  "/",
  zValidator(
    'json',
    z.object({
      title: z.string(),
    }),
  ),
  async (c) => {
    const { title } = c.req.valid('json')

    const newTodo = await createTodo(c.env.HONO_TODO, {
      title,
    });

    return c.json(newTodo, 201);
  },
);

todos.put(
  "/:id",
  zValidator(
    'json',
    z.object({
      title: z.string(),
      completed: z.boolean(),
    }),
  ),
  async (c) => {
    const id = c.req.param("id");
    const todo = await getTodo(c.env.HONO_TODO, id);
    const param = c.req.valid('json');

    if (!todo) {
      return c.json({ message: "not found" }, 404);
    }
    await updateTodo(c.env.HONO_TODO, id, param);
    return new Response(null, { status: 204 });
  },
);

todos.delete(
  "/:id",
  async (c) => {
    const id = c.req.param("id");
    const todo = await getTodo(c.env.HONO_TODO, id);
    if (!todo) {
      return c.json({ message: "not found" }, 404);
    }

    await deleteTodo(c.env.HONO_TODO, id);

    return new Response(null, { status: 204 });
  },
);

export { todos };
