import express, { Application, Response, Request } from "express";
import { Server } from "http";
import { expressMiddleware } from "@apollo/server/express4";
import dotenv from "dotenv";
import sequelize from "./database/connection";
import createApolloServer from "./graphql";
import UserService from "./services/user";
import cors from "cors";
import { Server as SocketIOServer } from "socket.io";

dotenv.config();

sequelize.sync()
    .then(() => console.log("database synced successfully"))
    .catch((err) => console.error("something went wrong", err))

async function init() {
    const app: Application = express();
    const PORT = Number(process.env.PORT) || 3000;

    // Create an HTTP server
    const server = new Server(app);

    // Create a Socket.IO server
    const io = new SocketIOServer(server);

    // Middlewares
    app.use(express.json());
    app.use(cors());

    app.use('/chat', express.static('public'));
    app.get('/chat/:room', (req, res) => {
        const room = req.params.room;
        res.sendFile(__dirname + '/public/chat.html'); // Serve the chat interface HTML file
    });

    // Authentication and authorization middleware
    app.use("/graphql", expressMiddleware(await createApolloServer(), {
        context: async ({ req }) => {
            try {
                const bearerToken = req.headers["authorization"];
                if (!bearerToken || !bearerToken.startsWith("Bearer")) {
                    throw new Error('Invalid Bearer token format');
                }
                const accessToken = bearerToken.slice(7, bearerToken.length).trim();
                const user = await UserService.decodeToken(accessToken);

                // Pass user and Socket.IO instance to context
                return { user, io };
            } catch (error) {
                return { io }; // You can include io even when authentication fails
            }
        }
    }));

    app.get("/", async (req: Request, res: Response): Promise<Response> => {
        return res.status(200).send({ message: `Welcome to the GraphQL Server` });
    });

    // Socket.IO configuration
    io.on("connection", (socket) => {
        console.log("A user connected.");

        socket.on("message", (data) => {
            console.log("data", data)
            let msg = data || data.message
            if (data.room)
                io.to(data.room).emit('message', msg);
            else
                io.emit("message", msg); // Broadcast the message to all connected clients
        });

        // Example: Joining rooms or namespaces
        socket.on("joinRoom", (room) => {
            console.log(`User joined room: ${room}`);
            socket.join(room); // Join a specific room
            // You can now broadcast messages to clients in this room using io.to(room).emit('message', data);
        });

        socket.on("disconnect", () => {
            console.log("A user disconnected.");
        });
    });

    // Start the HTTP server
    server.listen(PORT, () => {
        console.log(`Server started at PORT ${PORT}`);
    });
}

init();
