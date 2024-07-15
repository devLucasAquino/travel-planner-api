import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import nodemailer from 'nodemailer';
import { z } from 'zod';
import { dayjs } from '../lib/dayjs';
import { getMailClient } from '../lib/mail';
import { prisma } from './../lib/prisma';
import { ClientError } from "../errors/client-error";
import { env } from './../env';

export async function createInvite(app: FastifyInstance){
    app.withTypeProvider<ZodTypeProvider>().post(
        '/trips/:tripId/invites', 
    {
        schema: {
            params: z.object({
                tripId: z.string().uuid(),
            }),
            body: z.object({
                email: z.string().email(),
            })
        }
    }, async (request) => {
        const { tripId } = request.params;
        const { email } = request.body;

        const trip = await prisma.trip.findUnique({
            where: { id: tripId }
        })

        if(!trip){
            throw new ClientError('Trip not found.')
        }

        const participant = await prisma.participant.create({
            data:{
                email,
                trip_id: tripId,
            }
        })

        const formattedStartDate = dayjs(trip.starts_at).format('LL');
            const formattedEndDate = dayjs(trip.ends_at).format('LL');
       
            const mail = await getMailClient();

            const confirmationLink = `${env.API_BASE_URL}/participant/${participant.id}/confirm`

            const message = await mail.sendMail({
                from: {
                    name: 'Equipe Plann.er',
                    address: 'equipe@planner.com',
                },
                to: participant.email,

                    subject: `Confirme sua presença na viagem para ${trip.destination} em ${formattedStartDate}`,
                    html: `
            
                    <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6px;">
                        <p>Você foi convidado para participar de uma viagem para <strong>${trip.destination}</strong> nas datas de <strong>${formattedStartDate}</strong> até <strong>${formattedEndDate}</strong>.</p>
                        <p></p>
                        <p>Para confirmar sua presença na viagem, clique no link abaixo:</p>
                        <p></p>
                        <p>
                            <a href="${confirmationLink}">Confirma viagem</a>
                        </p>
                        <p></p>
                        <p>Caso não saiba do que se trata este e-mail, basta apenas ignora-lo</p>
                    </div>
                    `.trim()
            })
            
            console.log(nodemailer.getTestMessageUrl(message))


        return { participantId: participant.id }
    })
}