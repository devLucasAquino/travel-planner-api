import fastify from "fastify";
import { createTrip } from './routes/create-trip';
import { z } from 'zod';

const app = fastify();

app.register(createTrip)

app.listen({port: 3333}).then(() => {
    console.log('server running!')
})