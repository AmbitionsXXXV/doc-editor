import { z } from 'zod'

// Document schema
export const documentSchema = z.object({
	id: z.string().uuid(),
	title: z.string().min(1).max(255),
	content: z.string(),
	createdAt: z.date(),
	updatedAt: z.date(),
	userId: z.string().uuid(),
})

export type Document = z.infer<typeof documentSchema>
