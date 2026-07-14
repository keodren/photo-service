import { ALL_IMAGES } from '../data/image_store';
import { IRequest } from 'itty-router';

const getSingleImage = (request: IRequest) => {
    let image = ALL_IMAGES.find(i => i.id.toString() === request.params.id);

    if(!image) {
        return new Response('Not Found!', { status: 404 });
    }

    return new Response(JSON.stringify(image), {
        headers: { 'Content-Type': 'application/json' }
    });
};

export default getSingleImage; 