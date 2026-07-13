/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { AutoRouter } from 'itty-router';
import getImages from './handlers/get_images';

// 1. Initialize the modern AutoRouter
const router = AutoRouter();

// 2. Define your routes
router.get('/images', getImages);

// 3. Export the fetch pipeline cleanly using standard ESM syntax
export default {
    fetch: router.fetch
} satisfies ExportedHandler;

// OLD Version of itty-router Router method not supported anymore
/*
import getImages from './handlers/get_images';
import { Router } from 'itty-router'

//Create the router
const router = Router()

//Route traffic rules
router.get('/images', getImages);

//404 handler for routing anything else
router.all('*', () => new Response('Not Found', { status: 404 }));

export interface Env {
	// MY_KV_NAMSPACE: KVNamespace;
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const response = await router.handle(request);
		return response;
	},
} satisfies ExportedHandler<Env>;
*/

//export default {
//	async scheduled(event: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
//		switch (event.cron) {
//			case "*/15 * * * *":
//				console.log("This will run every 15 minutes");
//				break;
//			case "*/30 * * * *":
//				console.log("This will run every 30 minutes");
//				break;
//		}
//	}
//} satisfies ExportedHandler<Env>;