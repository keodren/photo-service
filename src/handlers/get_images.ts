import { ALL_IMAGES } from '../data/image_store';
import { IRequest } from 'itty-router'

const getImages = (request: IRequest) => {
    let images = ALL_IMAGES

    //if (request.query.count) {
    //    images = images.slice(0, parseInt(request.query.count[0]))
    //}

    // 1. Safely check if count exists in the query parameters
    if (request.query && request.query.count) {
        // 2. Treat request.query.count directly as a string, not an array
        const countParam = Array.isArray(request.query.count) 
            ? request.query.count[0] 
            : request.query.count;

        const count = parseInt(countParam, 10);
        
        if (!isNaN(count)) {
            images = images.slice(0, count);
        }
    }

    return new Response(JSON.stringify(images), {
        headers: { 'Content-Type': 'application/json' }
    });
};

export default getImages;