import 'dayjs/locale/pt-br';
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import nodemailer from 'nodemailer';
import { z } from 'zod';
import { dayjs } from '../lib/dayjs';
import { getMailClient } from '../lib/mail';
import { prisma } from "../lib/prisma";


export async function createTrip(app: FastifyInstance){
    app.withTypeProvider<ZodTypeProvider>().post('/trips', {
        schema: {
            body: z.object({
                destination: z.string().min(4),
                starts_at: z.coerce.date(),
                ends_at: z.coerce.date(),
                owner_name: z.string(),
                owner_email: z.string().email(),
                emails_to_invite: z.array(z.string().email()),
            })
        }
    }, async (request) => {
        const { destination, starts_at, ends_at, owner_name, owner_email, emails_to_invite } = request.body;

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
                pasticipants: {
                    createMany: {
                        data: [
                            {
                                name: owner_name,
                                email: owner_email,
                                is_owner: true,
                                is_confirmed: true,
                            },
                            ...emails_to_invite.map(email => {
                                return {email}
                            })
                        ]
                    }
                }
            }
        })

        const formattedStartDate = dayjs(starts_at).format('LL');
        const formattedEndDate = dayjs(ends_at).format('LL');

        const confirmationLink = `http://localhost:3333/trips/${trip.id}/confirm`

        const mail = await getMailClient();

        const message = await mail.sendMail({
            from: {
                name: 'Equipe Plann.er',
                address: 'equipe@planner.com',
            },
            to: {
                name: owner_name,
                address: owner_email,
            },
            subject: `Confirme sua viagem para ${destination} em ${formattedStartDate}`,
            html: `

            <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6px;">
                <p>Você solicitou uma viagem para <strong>${destination}</strong> nas datas de <strong>${formattedStartDate}</strong> até <strong>${formattedEndDate}</strong>.</p>
                <p></p>
                <p>Para confirmar sua viagem, clique no link abaixo:</p>
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


        return { tripId: trip.id }
    })
}