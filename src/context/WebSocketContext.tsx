"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import type { Category } from "@/lib/category";
import type { Products } from "@/lib/products";
import type { Orders, OrderStatus } from "@/lib/orders";

interface WebSocketContextType {
    connected: boolean;
    dbStatus: boolean | null;
    dbErrorMessage: string | null;
    categories: Category[];
    products: Products[];
    orders: Orders[];
    orderStatus: OrderStatus[];
    refreshItems: () => void;
    refreshOrders: () => void;
    refreshDb: () => void;
    sendMessage: (msg: any) => void;
}

const WebSocketContext = createContext<WebSocketContextType>({
    connected: false,
    dbStatus: null,
    dbErrorMessage: null,
    categories: [],
    products: [],
    orders: [],
    orderStatus: [],
    refreshItems: () => {},
    refreshOrders: () => {},
    refreshDb: () => {},
    sendMessage: () => {},
});

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
    const [connected, setConnected] = useState<boolean>(false);
    const [dbStatus, setDbStatus] = useState<boolean | null>(null);
    const [dbErrorMessage, setDbErrorMessage] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Products[]>([]);
    const [orders, setOrders] = useState<Orders[]>([]);
    const [orderStatus, setOrderStatus] = useState<OrderStatus[]>([]);

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const sendMessage = useCallback((msg: any) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(msg));
        }
    }, []);

    const refreshItems = useCallback(() => {
        sendMessage({ type: "REFRESH_ITEMS" });
    }, [sendMessage]);

    const refreshOrders = useCallback(() => {
        sendMessage({ type: "REFRESH_ORDERS" });
    }, [sendMessage]);

    const refreshDb = useCallback(() => {
        sendMessage({ type: "REFRESH_DB" });
    }, [sendMessage]);

    useEffect(() => {
        let isMounted = true;

        function connect() {
            if (typeof window === "undefined") return;

            const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
            const wsUrl = `${protocol}//${window.location.host}/ws`;

            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                if (!isMounted) return;
                setConnected(true);
                console.log("[WebSocket] Connected to real-time server at", wsUrl);
            };

            ws.onmessage = (event) => {
                if (!isMounted) return;
                try {
                    const message = JSON.parse(event.data);
                    switch (message.type) {
                        case "DB_STATUS":
                            setDbStatus(message.connected);
                            setDbErrorMessage(message.message || null);
                            break;
                        case "CATEGORIES_DATA":
                            if (Array.isArray(message.data)) {
                                setCategories(message.data);
                            }
                            break;
                        case "PRODUCTS_DATA":
                            if (Array.isArray(message.data)) {
                                setProducts(message.data);
                            }
                            break;
                        case "ORDERS_DATA":
                            if (Array.isArray(message.data)) {
                                setOrders(message.data);
                            }
                            break;
                        case "ORDER_STATUS_DATA":
                            if (Array.isArray(message.data)) {
                                setOrderStatus(message.data);
                            }
                            break;
                        default:
                            break;
                    }
                } catch (err) {
                    console.error("[WebSocket] Error parsing incoming message:", err);
                }
            };

            ws.onerror = (err) => {
                console.warn("[WebSocket] Connection error:", err);
            };

            ws.onclose = () => {
                if (!isMounted) return;
                setConnected(false);
                console.log("[WebSocket] Disconnected. Reconnecting in 3 seconds...");
                reconnectTimeoutRef.current = setTimeout(() => {
                    if (isMounted) connect();
                }, 3000);
            };
        }

        connect();

        return () => {
            isMounted = false;
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    return (
        <WebSocketContext.Provider
            value={{
                connected,
                dbStatus,
                dbErrorMessage,
                categories,
                products,
                orders,
                orderStatus,
                refreshItems,
                refreshOrders,
                refreshDb,
                sendMessage,
            }}
        >
            {children}
        </WebSocketContext.Provider>
    );
}

export function useWebSocket() {
    return useContext(WebSocketContext);
}
