const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000; // Or your preferred port

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*", // Adjust for production
      methods: ["GET", "POST"],
    },
  });

  // Socket.IO connection logic (similar to socketServer.ts)
  io.on("connection", (socket) => {
    console.log(`\x1b[32m✔ Client Connected:\x1b[0m`, socket.id);

    socket.on("join-debate", (debateId) => {
      socket.join(debateId);
      console.log(`Client ${socket.id} joined debate: ${debateId}`);
    });

    socket.on("debate-message", (message) => {
      // Emit only to others in the room
      socket.to(message.sessionId).emit("debate-message", message);
      console.log(
        `Message from ${message.personaId} in debate ${message.sessionId}`
      );
    });

    socket.on("disconnect", (reason) => {
      console.log(
        `\x1b[31m✖ Client Disconnected:\x1b[0m`,
        socket.id,
        `Reason: ${reason}`
      );
    });

    socket.on("error", (error) => {
      console.error("Socket Error:", error);
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> Socket.IO server initialized and attached.`);
    });
});
