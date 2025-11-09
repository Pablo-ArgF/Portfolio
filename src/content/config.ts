import { defineCollection, z } from "astro:content";

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
    linkedinUrl: z.string().url().optional(), 
    imageUrl: z.string().url().optional(),    
  }),
});

const projectCollection = defineCollection({
  schema: z.object({
    titulo: z.string(),
    fechaInicio: z.string(),
    fechaFin: z.string().optional(),
    skills: z.array(z.string()).optional(),
    githubUrl: z.string().url().optional(),
    imagen: z.string().optional(), 
    descripcion: z.string().optional(), 
  }),
});

export const collections = {
  experience: experienceCollection,
  review: reviewCollection,
  project: projectCollection,
};
