'use client';

import { useEffect, useState } from "react";
import { getAllOrders, type Orders, getAllOrderStatus, type OrderStatus } from "@/lib/orders";

export default function Orders(){
    const [orders, setOrders] = useState<Orders[]>([]);
    const [status, setstatus] = useState<OrderStatus[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [activeStatus, setActiveStatus] = useState<number>(0);
    const [searchTerm, setSearchTerm] = useState<string>("");
    
    useEffect(() => {
        async function loadOrders() {
            try {
                const data = await getAllOrders();
                console.log("Fetched orders from DB:", data);
                setOrders(data);
            } catch (error: any) {
                const msg = error.message || "Failed to connect to the database.";
                setErrorMessage(msg);
                console.error(msg);
            }
        }
        loadOrders();
    }, []);

    useEffect(() => {
        async function loadOrderStatus() {
            try {
                const data = await getAllOrderStatus();
                console.log("Fetched orders from DB:", data);
                setstatus(data);
            } catch (error: any) {
                const msg = error.message || "Failed to connect to the database.";
                setErrorMessage(msg);
                console.error(msg);
            }
        }
        loadOrderStatus();
    }, []);

    return(
        <section className="orderSection">
            <div className="search">
                <input type="text" placeholder="Search by name or ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <ul className="orderCategoryList">
                <li><button onClick={() => setActiveStatus(0)} className={activeStatus === 0 ? "active" : ""}>All Orders</button></li>
                {status.map((stat) => (
                    <li key={stat.statusId}><button value={stat.statusId} onClick={() => setActiveStatus(stat.statusId)} className={activeStatus === stat.statusId ? "active" : ""}>{stat.status}</button></li>
                ))}
            </ul>
            <div className="orderTable">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Customer</th>
                            <th>Address</th>
                            <th>Date</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders
                            .filter((ord) => {
                                const searchLower = searchTerm.toLowerCase();
                                const matchesSearch =
                                ord.customerName.toLowerCase().includes(searchLower) ||
                                String(ord.orderID).toLowerCase().includes(searchLower) ||
                                ord.address.toLowerCase().includes(searchLower);

                                if (!matchesSearch) return false;

                                if (activeStatus === 0) return true;

                                const matched = status.find((s) => s.statusId === activeStatus);
                                if (!matched || !matched.currentOrderStatus) return false;

                                const statusOrders = Array.isArray(matched.currentOrderStatus)
                                ? matched.currentOrderStatus
                                : typeof matched.currentOrderStatus === "string"
                                ? (JSON.parse(matched.currentOrderStatus) as { orderId: number }[])
                                : (matched.currentOrderStatus as unknown as { orderId: number }[]);

                                return statusOrders.some((item) => item.orderId === ord.orderID);
                            })
                            .map((ord) => (
                                <tr key={ord.orderID}>
                                <td>{ord.orderID}</td>
                                <td>{ord.customerName}</td>
                                <td>{ord.address}</td>
                                <td>{new Date(ord.orderDate).toLocaleDateString("en-CA")}</td>
                                <td>Rs. {ord.totalPrice}/=</td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}