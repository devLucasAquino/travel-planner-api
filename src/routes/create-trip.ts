import { FastifyInstance } from "fastify";
import { z } from 'zod';
import dayjs from 'dayjs';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { prisma } from "../lib/prisma";

export async function createTrip(app: FastifyInstance){
    app.withTypeProvider<ZodTypeProvider>().post('/trips', {
        schema: {
            body: z.object({
                destination: z.string().min(4),
                starts_at: z.coerce.date(),
                ends_at: z.coerce.date(),
            })
        }
    }, async (request) => {
        const { destination, starts_at, ends_at } = request.body;

        if(dayjs(starts_at).isBefore(new Date())){
            throw new Error('invalid trip start date.');
        }

        if(dayjs(ends_at).isBefore(starts_at)){
            throw new Error('invalid trip end date.');
        }

        const trip = await prisma.trip.create({
            data: {
                destination,
                starts_at,
                ends_at,
            }
        })
        return { tripId: trip.id }
    })
}