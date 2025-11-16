import { z } from 'zod';

export const createPostSchema = z.object({
  content: z.string().min(1, 'El contenido no puede estar vacío').max(2000, 'Máximo 2000 caracteres'),
  images: z.array(
    z.object({
      url: z.string().url('Debe ser una URL válida'),
      alt: z.string().optional(),
    })
  ).optional(),
  workout_id: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  is_public: z.boolean().default(true),
});

export const updatePostSchema = createPostSchema.partial();

export const createCommentSchema = z.object({
  content: z.string().min(1, 'El comentario no puede estar vacío').max(500, 'Máximo 500 caracteres'),
  parent_comment_id: z.string().uuid().optional(),
});

export const postFiltersSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  user_id: z.string().uuid().optional(),
  search: z.string().optional(),
});

export type CreatePostFormData = z.infer<typeof createPostSchema>;
export type UpdatePostFormData = z.infer<typeof updatePostSchema>;
export type CreateCommentFormData = z.infer<typeof createCommentSchema>;
export type PostFilters = z.infer<typeof postFiltersSchema>;
