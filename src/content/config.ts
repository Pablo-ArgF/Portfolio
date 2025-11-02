import { defineCollection, z } from 'astro:content';

const experienceCollection = defineCollection({
  schema: z.object({
    position: z.string(),
    company: z.string(),
    location: z.string(),
    startDate: z.string(),
    endDate: z.string().optional(),
    logo: z.string(), // ruta a imagen
  }),
});


const reviewCollection = defineCollection({
  schema: z.object({
    name: z.string(),
    linkedinUrl: z.string().url(),
    imageUrl: z.string().url()
  }),
});

export const collections = {
  experience: experienceCollection,
  review: reviewCollection
};
