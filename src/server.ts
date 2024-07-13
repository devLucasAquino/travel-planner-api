import { prisma } from './lib/prisma';
import fastify from "fastify";

const app = fastify();

app.get('/cadastrar', async () => {
    await prisma.trip.create({
        data: {
            destination: 'São José do Campestre',
            starts_at: new Date(),
            ends_at: new Date(),

        },
    })

    return 'Registro cadastrado com sucesso!'
})

app.get('/listar', async () => {
    const trips = await prisma.trip.findMany();

    return trips;
})

app.listen({port: 3333}).then(() => {
    console.log('server running!')
})