import { FastifyInstance } from "fastify";
import { z } from 'zod';
import 'dayjs/locale/pt-br';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

export async function confirmTrip(app: FastifyInstance){
    app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId/confirm', {
        schema: {
            params: z.object({
                tripId: z.string().uuid(),
            })
        }
    }, async (request) => {

        return { tripId: request.params.tripId }
    })
}