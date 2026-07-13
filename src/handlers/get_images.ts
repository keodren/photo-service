import { ALL_IMAGES } from '../data/image_store';
import { IRequest } from 'itty-router';

const getImages = (request: IRequest): Response => {
    let images = ALL_IMAGES;

    // In v5, request.query.count is automatically a string (e.g., "2")
    if (request.query && request.query.count) {
        const count = parseInt(request.query.count as string, 10);
        
        if (!isNaN(count)) {
            images = images.slice(0, count);
        }
    }

    // AutoRouter will naturally handle this response format
    return new Response(JSON.stringify(images), {
        headers: { 'Content-Type': 'application/json' }
    });
};

export default getImages;