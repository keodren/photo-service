//import { ALL_IMAGES } from '../data/image_store';
import { IRequest } from 'itty-router';
import { Env } from '../env';

//const getImages = (request: IRequest): Response => {
const getImages = async (request: IRequest, env: Env): Promise<Response> => {
    //const limit = request.query.count ? request.query.count[0] : 10

    // Safe conversion: Grab the count string, turn it into a real base-10 integer, 
    // and fallback to 10 if it's missing or invalid (NaN).
    const limit = parseInt(request.query.count as string, 10) || 10;
    //let images = ALL_IMAGES;
    let results;

    try {
        results = await env.DB.prepare(
            `SELECT i.*, c.display_name as category_display_name
               FROM images i
              INNER JOIN image_categories c ON i.category_id = c.id
              ORDER BY i.created_at DESC
              LIMIT ?1`
        )
        .bind(limit)
        .all()
    } catch (e) {
        let message;
        if (e instanceof Error) message = e.message;
        console.log({message: message});

        return new Response('Error', {status: 500})
    }

    if (!results.success) {
        return new Response('There was a problem retrieving images', {status: 500})
    }

    /*// In v5, request.query.count is automatically a string (e.g., "2")
    if (request.query && request.query.count) {
        const count = parseInt(request.query.count as string, 10);
        
        if (!isNaN(count)) {
            images = images.slice(0, count);
        }
    }*/

    // AutoRouter will naturally handle this response format
    //return new Response(JSON.stringify(images), {
    return new Response(JSON.stringify(results.results), {
        headers: { 'Content-Type': 'application/json' }
    });
};

export default getImages;