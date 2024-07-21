import dayjs from 'dayjs';
import { prisma } from './../lib/prisma';
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { ClientError } from '../errors/client-error';

export async function getActivityDetails(app: FastifyInstance){
    app.withTypeProvider<ZodTypeProvider>().get(
        '/trips/:tripId/activities/:activityId', 
    {
        schema: {
            params: z.object({
                tripId: z.string().uuid(),
                activityId: z.string().uuid(),
            }),
        }
    }, async (request) => {
        const { tripId, activityId } = request.params;

        const activity = await prisma.activity.findUnique({
            where: { id: activityId},
        })

        return { activity }
    })
}