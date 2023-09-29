import { Hono } from "hono";
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { Bindings } from "./bindings";

let todoList = [
  { id: "1", title: "Learning Hono", completed: false },
  { id: "2", title: "Watch the movie", completed: true },
  { id: "3", title: "Buy milk", completed: false },
];

const todos = new Hono<{ Bindings: Bindings }>();

todos.get("/", (c) => c.json(todoList));

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
    const newTodo = {
      id: String(todoList.length + 1),
      completed: false,
      title: title,
    };
    todoList = [...todoList, newTodo];

    return c.json(newTodo, 201);
  });

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
    const todo = todoList.find((todo) => todo.id === id);
    if (!todo) {
      return c.json({ message: "not found" }, 404);
    }
    const param = c.req.valid('json');

    todoList = todoList.map((todo) => {
      if (todo.id === id) {
        return {
          ...todo,
          ...param,
        };
      } else {
        return todo;
      }
    });
    return new Response(null, { status: 204 });
  },
);

todos.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const todo = todoList.find((todo) => todo.id === id);
  if (!todo) {
    return c.json({ message: "not found" }, 404);
  }
  todoList = todoList.filter((todo) => todo.id !== id);

  return new Response(null, { status: 204 });
});

export { todos };
