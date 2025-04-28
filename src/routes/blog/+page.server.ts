import type { PageServerLoad } from './$types';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const POSTS_DIR = path.resolve('content/blog');

export interface PostMetadata {
	title: string;
	date: string;
	tags: string[];
	excerpt: string;
	slug: string; // Added slug based on filename
}

export const load: PageServerLoad = async () => {
	let posts: PostMetadata[] = [];
	let allTags: string[] = []; // <-- Add array to hold all tags

	try {
		const files = fs.readdirSync(POSTS_DIR).filter((file: string) => file.endsWith('.md'));

		posts = files
			.map((filename: string) => {
				const filePath = path.join(POSTS_DIR, filename);
				const fileContent = fs.readFileSync(filePath, 'utf8');
				const { data } = matter(fileContent);
				const slug = filename.replace(/\.md$/, ''); // Remove .md extension

				// Basic validation
				if (!data.title || !data.date) {
					console.warn(`Skipping ${filename}: missing title or date in frontmatter.`);
					return null; // Skip this post if essential data is missing
				}

				return {
					title: data.title,
					date: data.date,
					tags: data.tags || [], // Default to empty array if tags are missing
					excerpt: data.excerpt || '', // Default to empty string
					slug: slug
				};
			})
			.filter((post): post is PostMetadata => post !== null); // Filter out null entries and assert type

		// Sort posts by date, newest first
		posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

		// Collect all unique tags
		const tagSet = new Set<string>();
		posts.forEach((post) => {
			post.tags.forEach((tag) => tagSet.add(tag));
		});
		allTags = Array.from(tagSet).sort(); // Sort tags alphabetically
	} catch (error: unknown) {
		// If directory doesn't exist or other FS error
		// Need to check error type before accessing properties like .code
		if (error instanceof Error && 'code' in error && (error as { code: string }).code === 'ENOENT') {
			console.warn(`Blog content directory not found at ${POSTS_DIR}. No posts loaded.`);
		} else {
			console.error('Error reading blog posts:', error);
		}
		// Return empty array or handle error as needed
		posts = [];
		allTags = [];
	}

	return {
		posts,
		allTags // <-- Return the collected tags
	};
};
