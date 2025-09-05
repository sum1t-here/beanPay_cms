import { PrismaClient } from "./generated/prisma";

const prismaClientSingleTon = () => {
    return new PrismaClient();
}

// Declaring a global type for the prisma variable
declare global{
    var prismaClient: undefined | ReturnType<typeof prismaClientSingleTon>;
}

const prismaClient: ReturnType<typeof prismaClientSingleTon> = globalThis.prismaClient ?? prismaClientSingleTon();

export default prismaClient;

// In a development environment (non-production), we attach the prisma instance to globalThis
// This helps in reusing the same instance during hot-reloading, preventing new instances on each reload
if (process.env.NODE_ENV !== "production") globalThis.prismaClient = prismaClient;