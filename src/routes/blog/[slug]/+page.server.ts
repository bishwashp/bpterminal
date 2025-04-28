import type { PageServerLoad } from './$types';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { error } from '@sveltejs/kit';

const POSTS_DIR = path.resolve('content/blog');

export interface PostData {
	title: string;
	date: string;
	tags: string[];
	content: string; // Full markdown content
	slug: string;
}

export const load: PageServerLoad = async ({ params }) => {
	const { slug } = params;
	const filePath = path.join(POSTS_DIR, `${slug}.md`);

	try {
		if (!fs.existsSync(filePath)) {
			throw error(404, 'Post not found');
		}

		const fileContent = fs.readFileSync(filePath, 'utf8');
		const { data, content } = matter(fileContent);

		if (!data.title || !data.date) {
			console.warn(`Post ${slug}.md is missing title or date.`);
			// Decide if this should be a 404 or render with missing data
			throw error(500, 'Post metadata is incomplete');
		}

		return {
			post: {
				title: data.title,
				date: data.date,
				tags: data.tags || [],
				content: content, // Pass the raw markdown content
				slug: slug
			} satisfies PostData // Ensure shape matches interface
		};
	} catch (err: unknown) {
		// Re-throw SvelteKit errors, handle others
		// Check if it's a SvelteKit HttpError or similar structure
		if (typeof err === 'object' && err !== null && 'status' in err) {
			throw err; // Re-throw SvelteKit HttpError
		}

		// Log other errors and throw a generic 500
		console.error(`Error loading post ${slug}:`, err);
		const message = err instanceof Error ? err.message : 'Unknown error';
		throw error(500, `Failed to load post: ${message}`);
	}
};
