// 1. The Escape Hatch: Manually define the module so TypeScript stops looking for it
import { Env } from '../src/env';

declare module "cloudflare:test" {
    // We explicitly tell TS exactly what exports to expect from this virtual module
    export const env: Env;
    export const SELF: { fetch: (url: string | Request, init?: any) => Promise<Response> };
    export const createExecutionContext: () => any;
    export const waitOnExecutionContext: (ctx: any) => Promise<void>;
}

import {
	env,
	createExecutionContext,
	waitOnExecutionContext,
	SELF,
} from "cloudflare:test";

import { describe, it, expect, beforeAll } from "vitest";

describe("Photo Service API - Unit Tests", () => {
	// Setup the Database Schema and Seed Data in the Isolated Test Environment
    beforeAll(async () => {
        // 1. Create the tables using a batch of prepared statements
        await env.DB.batch([
            env.DB.prepare(`
                CREATE TABLE IF NOT EXISTS image_categories (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    slug TEXT UNIQUE,
                    display_name TEXT,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                );
            `),
            env.DB.prepare(`
                CREATE TABLE IF NOT EXISTS images (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    category_id INTEGER NOT NULL,
                    user_id INTEGER NOT NULL,
                    image_url TEXT NOT NULL,
                    title TEXT NOT NULL,
                    format TEXT NOT NULL,
                    resolution TEXT NOT NULL,
                    file_size_bytes INTEGER NOT NULL,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (category_id) REFERENCES image_categories(id)
                );
            `),
            env.DB.prepare(`
                CREATE INDEX IF NOT EXISTS idx_images_created_at ON images(created_at);
            `)
        ]);

        // 2. Seed with your exact initial setup rows using a batch
        await env.DB.batch([
            env.DB.prepare(`
                INSERT OR IGNORE INTO image_categories (id, slug, display_name) VALUES
                (1, 'animals', 'Animals'),
                (2, 'landscapes', 'Landscapes'),
                (3, 'sports-cars', 'Sports Cars');
            `),
            env.DB.prepare(`
                INSERT INTO images(id, category_id, user_id, image_url, title, format, resolution, file_size_bytes)
                VALUES
                (1, 1, 1, 'https://example.com/some_image.png', 'Example 1', 'PNG', '600x400', 1024),
                (2, 2, 2, 'https://example.com/another_image.jpg', 'Example 2', 'JPG', '600x400', 1024),
                (3, 3, 3, 'https://example.com/one_more_image.png', 'Example 3', 'PNG', '600x400', 1024),
                (4, 3, 4, 'https://example.com/last_mage.jpg', 'Example 4', 'JPG', '600x400', 1024);
            `)
        ]);
    });

	// Testing a non-existing endpoint
	it("returns a 404 if a non-existent endpoint is called", async () => {
		const response = await SELF.fetch('http://www.example.com/invalid-endpoint');
		expect(response.status).toEqual(404);
    });

	// Testing all GET APIs
	describe("GET /images", () => {
		it("should return a 200 OK response", async () => {
			const response = await SELF.fetch('http://www.example.com/images');
			expect(response.status).toEqual(200);
		});

		it("should return images in response", async () => {
			const response = await SELF.fetch('http://www.example.com/images');
			const json = await response.json();
			expect(json).toEqual(
        		expect.arrayContaining([
            		expect.objectContaining({
               			// These fields match the first INSERT statement from your beforeAll block
                		id: 1, 
                		image_url: 'https://example.com/some_image.png', 
                		title: 'Example 1',
                		format: 'PNG',
                		resolution: '600x400',
                		file_size_bytes: 1024,
                
                		// If your GET /images handler still has the INNER JOIN we discussed earlier, 
                		// it will also return the joined category name:
                		category_display_name: 'Animals'
					}
				)])
    );
		});

		it("should return a set number of images if a count is provided", async () => {
			const response = await SELF.fetch('http://www.example.com/images?count=2');
			const json = await response.json();
			expect(json).toHaveLength(2);
		});

		//This test was not included in the book, but the use case does exist.
		//I'm going to query for a specific single image
		it("should return a specific image when ID is passed in the URL", async () => {
			const response = await SELF.fetch('http://www.example.com/images/2');
			const json = await response.json();
			expect(json).toEqual(
				expect.objectContaining(
					{ id: 2, 
            		  image_url: 'https://example.com/another_image.jpg', 
            		  title: 'Example 2',
            		  format: 'JPG',
            		  resolution: '600x400',
            		  file_size_bytes: 1024
					} //example located at ../src/data/image_store.ts
				)
			);
		});
	});

	// Testing all POST APIs
	describe("POST /images", () => {
		
		// Test Data Payload
        const payload = {
            category_id: 1,
            user_id: 99,
            image_url: "https://example.com/new_upload.png",
            title: "Lia Michelle",
            format: "PNG",
            resolution: "1920x1080",
            file_size_bytes: 2048
        };

		it("should return a 201 response code", async () => {
			const response = await SELF.fetch('http://www.example.com/images', {
				method: "POST",
				body: JSON.stringify(payload),
				headers: { 'Content-Type': 'application/json' }
			});

			expect(response.status).toEqual(201);
		});

		it("should return the created image in the response", async () => {
			const response = await SELF.fetch('http://www.example.com/images', {
				method: "POST",
				body: JSON.stringify(payload),
				headers: { 'Content-Type': 'application/json' }
			});

			const json = await response.json();

			expect(json).toEqual(
				expect.objectContaining({
                    category_id: payload.category_id,
                    user_id: payload.user_id,
                    image_url: payload.image_url,
                    title: payload.title,
                    format: payload.format,
                    resolution: payload.resolution,
                    file_size_bytes: payload.file_size_bytes,
                    
                    // The database auto-generates the ID (it will likely be 5, 
                    // since we seeded 1 through 4 in beforeAll)
                    id: expect.any(Number) 
                })
			);
		});
	});
});
