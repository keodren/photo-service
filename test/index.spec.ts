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

describe("Photo Service - Unit Tests", () => {
	// Testing a non-existing endpoint
	it("returns a 404 if a non-existent endpoint is called", async () => {
		const response = await SELF.fetch('http://www.example.com/invalid-endpoint');
		expect(response.status).toEqual(404);
    });

	// Testing all GET APIs
	describe("Testing - GET /images", () => {
		it("should return a 200 OK response", async () => {
			const response = await SELF.fetch('http://www.example.com/images');
			expect(response.status).toEqual(200);
		});
	});
});
