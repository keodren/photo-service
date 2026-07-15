import {
	env,
	createExecutionContext,
	waitOnExecutionContext,
	SELF,
} from "cloudflare:test";
import { describe, it, expect } from "vitest";
import worker from "../src/index";

// For now, you'll need to do something like this to get a correctly-typed
// `Request` to pass to `worker.fetch()`.
const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe("Photo Service API - Unit Tests", () => {
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
					expect.objectContaining(
						{ id: 1, url: 'https://foo.com/img1', author: 'bart Simpson'} //example located at ../src/data/image_store.ts
					)
				])
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
					{ id: 2, url: 'https://baz.com/img2', author: 'Larry Lobster'} //example located at ../src/data/image_store.ts
				)
			);
		});
	});

	// Testing all POST APIs
	describe("POST /images", () => {
		it("should return a 201 response code", async () => {
			const payload = {
				"id": 4,
				"url": "https://example.com/some_image.png",
				"author": "Lia Michelle"
			}
			
			const response = await SELF.fetch('http://www.example.com/images', {
				method: "POST",
				body: JSON.stringify(payload)
			});

			expect(response.status).toEqual(201);
		});

		it("should return the created image in the response", async () => {
			const newImage = {
				"id": 4,
				"url": "https://example.com/some_image.png",
				"author": "Lia Michelle"
			}
			
			const response = await SELF.fetch('http://www.example.com/images', {
				method: "POST",
				body: JSON.stringify(newImage)
			});

			const json = await response.json();

			expect(json).toEqual(
				expect.objectContaining(newImage)
			);
		});
	});
});
