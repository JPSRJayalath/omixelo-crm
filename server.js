const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { WebSocketServer, WebSocket } = require("ws");
const mysql = require("mysql2/promise");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOST || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Database connection pool for real-time WebSocket queries
const dbPool = mysql.createPool({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Jpsr@@@8141236",
    database: "omixelo_crm",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function checkDb() {
    try {
        const connection = await dbPool.getConnection();
        await connection.ping();
        connection.release();
        return { connected: true, message: "Connected to omixelo_crm" };
    } catch (error) {
        return { connected: false, message: error.message || "Database connection failed" };
    }
}

async function fetchCategories() {
    try {
        const [rows] = await dbPool.query("SELECT * FROM category");
        return rows;
    } catch (e) {
        return null;
    }
}

async function fetchProducts() {
    try {
        const [rows] = await dbPool.query("SELECT * FROM products");
        return rows.map((row) => ({
            pId: row.pId,
            pName: row.pName,
            pImage: row.pImage ? Array.from(row.pImage) : null,
            pDescribe: row.pDescribe,
            pPrice: row.pPrice,
            pStock: row.pStock,
            categoryId: row.categoryId,
        }));
    } catch (e) {
        return null;
    }
}

async function fetchOrders() {
    try {
        const [rows] = await dbPool.query("SELECT * FROM orders");
        return rows;
    } catch (e) {
        return null;
    }
}

async function fetchOrderStatus() {
    try {
        const [rows] = await dbPool.query("SELECT * FROM orderStatus");
        return rows;
    } catch (e) {
        return null;
    }
}

app.prepare().then(() => {
    const server = createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url, true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error("Error handling request:", req.url, err);
            res.statusCode = 500;
            res.end("Internal Server Error");
        }
    });

    const wss = new WebSocketServer({ noServer: true });

    function broadcast(data) {
        const payload = JSON.stringify(data);
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(payload);
            }
        });
    }

    async function broadcastDbStatus() {
        const status = await checkDb();
        broadcast({ type: "DB_STATUS", ...status });
        return status;
    }

    async function broadcastCategories() {
        const categories = await fetchCategories();
        if (categories !== null) {
            broadcast({ type: "CATEGORIES_DATA", data: categories });
        }
    }

    async function broadcastProducts() {
        const products = await fetchProducts();
        if (products !== null) {
            broadcast({ type: "PRODUCTS_DATA", data: products });
        }
    }

    async function broadcastOrders() {
        const orders = await fetchOrders();
        if (orders !== null) {
            broadcast({ type: "ORDERS_DATA", data: orders });
        }
    }

    async function broadcastOrderStatus() {
        const orderStatus = await fetchOrderStatus();
        if (orderStatus !== null) {
            broadcast({ type: "ORDER_STATUS_DATA", data: orderStatus });
        }
    }

    async function broadcastAll() {
        await broadcastDbStatus();
        await broadcastCategories();
        await broadcastProducts();
        await broadcastOrders();
        await broadcastOrderStatus();
    }

    // Expose global methods for Server Actions
    globalThis.omixeloWs = {
        broadcast,
        broadcastDbStatus,
        broadcastCategories,
        broadcastProducts,
        broadcastOrders,
        broadcastOrderStatus,
        broadcastAll
    };

    // Handle WebSocket upgrade specifically for /ws
    server.on("upgrade", (req, socket, head) => {
        const { pathname } = parse(req.url || "");
        if (pathname === "/ws") {
            wss.handleUpgrade(req, socket, head, (ws) => {
                wss.emit("connection", ws, req);
            });
        }
        // Other upgrades (like Next.js HMR) are handled automatically
    });

    wss.on("connection", async (ws) => {
        // Send initial DB status and data to newly connected client
        const dbStatus = await checkDb();
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "DB_STATUS", ...dbStatus }));
        }

        if (dbStatus.connected) {
            const [categories, products, orders, orderStatus] = await Promise.all([
                fetchCategories(),
                fetchProducts(),
                fetchOrders(),
                fetchOrderStatus()
            ]);

            if (ws.readyState === WebSocket.OPEN) {
                if (categories) ws.send(JSON.stringify({ type: "CATEGORIES_DATA", data: categories }));
                if (products) ws.send(JSON.stringify({ type: "PRODUCTS_DATA", data: products }));
                if (orders) ws.send(JSON.stringify({ type: "ORDERS_DATA", data: orders }));
                if (orderStatus) ws.send(JSON.stringify({ type: "ORDER_STATUS_DATA", data: orderStatus }));
            }
        }

        ws.on("message", async (data) => {
            try {
                const message = JSON.parse(data.toString());
                switch (message.type) {
                    case "REFRESH_ITEMS":
                        await Promise.all([broadcastCategories(), broadcastProducts()]);
                        break;
                    case "REFRESH_ORDERS":
                        await Promise.all([broadcastOrders(), broadcastOrderStatus()]);
                        break;
                    case "REFRESH_DB":
                        await broadcastDbStatus();
                        break;
                    case "PING":
                        ws.send(JSON.stringify({ type: "PONG" }));
                        break;
                    default:
                        break;
                }
            } catch (err) {
                console.error("[WebSocket Server] Error processing message:", err);
            }
        });
    });

    // Background DB health check every 5 seconds
    let lastDbConnected = null;
    setInterval(async () => {
        const status = await checkDb();
        if (lastDbConnected !== status.connected) {
            lastDbConnected = status.connected;
            broadcast({ type: "DB_STATUS", ...status });
            if (status.connected) {
                await broadcastAll();
            }
        }
    }, 5000);

    server.listen(port, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://${hostname}:${port} (with WebSockets on ws://${hostname}:${port}/ws)`);
    });
});
