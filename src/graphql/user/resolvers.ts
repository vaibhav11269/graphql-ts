import UserService, { CreateUserPayload } from "../../services/user";
import { Redis } from 'ioredis';

const redis = new Redis({
    host: 'localhost',
    port: 6379,
});

const queries = {
    getUserToken: async (_: any, payload: { email: string, password: string }) => {
        const token = await UserService.generateUserToken({
            email: payload.email,
            password: payload.password
        })
        return token;
    },
    getAllUsers: async (__: any, _: any, context: any) => {
        if (!context || !context.user)
            throw new Error("Unauthenticated User")

        //check for users list in cache
        const cachedUserData = await redis.get("usesr");
        if (cachedUserData) {
            return JSON.parse(cachedUserData);
        }

        const allUsers = await UserService.getAllUsers();
        await redis.set("users", JSON.stringify(allUsers));
        return allUsers;
    }
};
const mutations = {
    createUser: async (_: any, payload: CreateUserPayload) => {
        let newUser = await UserService.createUser(payload);
        return newUser.id;
    }
};

export const resolvers = { queries, mutations };