import { defineCollection } from "astro:content";
import { file } from "astro/loaders";
import { z } from "astro/zod";

const services = defineCollection({
  loader: file("src/content/services.json"),
  schema: z.object({
    order: z.number(),
    title: z.string(),
    icon: z.enum(["laptop", "shield", "fan", "drive", "ink", "disc"]),
    summary: z.string(),
    points: z.array(z.string()).min(1),
  }),
});

const reviews = defineCollection({
  loader: file("src/content/reviews.json"),
  schema: z.object({
    author: z.string(),
    quote: z.string(),
  }),
});

const faqs = defineCollection({
  loader: file("src/content/faqs.json"),
  schema: z.object({
    order: z.number(),
    question: z.string(),
    answer: z.string(),
  }),
});

export const collections = { services, reviews, faqs };
