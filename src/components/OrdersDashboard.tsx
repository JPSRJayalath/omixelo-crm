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
        let isMounted = true;
        let timeoutId: ReturnType<typeof setTimeout>;

        async function loadOrders() {
            try {
                const data = await getAllOrders();
                if (!isMounted) return;

                console.log("Fetched orders from DB:", data);
                setOrders(data);
            } 
            catch (error: any) {
                if(!isMounted) return;

                const msg = (!error?.message || error.message.includes("Server Components render"))
                    ? "Failed to connect to the database."
                    : error.message;
                setErrorMessage(msg);
                console.error("Database connection error:", msg);
            }

            finally{
                if (isMounted){
                    timeoutId = setTimeout(loadOrders, 5000);
                }
            }
        }
        loadOrders();

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, []);

    useEffect(() => {
        let isMounted = true;
        let timeoutId: ReturnType<typeof setTimeout>;

        async function loadOrderStatus() {
            try {
                const data = await getAllOrderStatus();
                if (!isMounted) return;

                console.log("Fetched order status from DB:", data);
                setstatus(data);
            } catch (error: any) {
                if (!isMounted) return;
                const msg = (!error?.message || error.message.includes("Server Components render"))
                    ? "Failed to connect to the database."
                    : error.message;
                setErrorMessage(msg);
                console.error("Database connection error:", msg);
            } finally {
                if (isMounted) {
                    timeoutId = setTimeout(loadOrderStatus, 5000);
                }
            }
        }

        loadOrderStatus();

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, []);

    return(
        <section className="orderSection">
            <div className="search">
                <input type="text" placeholder="Search by name, ID, address or phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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
                            <th>Customer</th>
                            <th>Address</th>
                            <th>Whatsapp No.</th>
                            <th>Date</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders
                            .filter((ord) => {
                                const searchLower = searchTerm.toLowerCase();
                                const matchesSearch =
                                    (ord.customerName?.toLowerCase().includes(searchLower) ?? false) ||
                                    String(ord.orderID).toLowerCase().includes(searchLower) ||
                                    (ord.address?.toLowerCase().includes(searchLower) ?? false) ||
                                    (ord.waNum?.toLowerCase().includes(searchLower) ?? false);

                                if (!matchesSearch) return false;

                                if (activeStatus === 0) return true;

                                const matched = status.find((s) => s.statusId === activeStatus);
                                if (!matched || !matched.currentOrderStatus) return false;

                                try {
                                    const statusOrders = Array.isArray(matched.currentOrderStatus)
                                        ? matched.currentOrderStatus
                                        : typeof matched.currentOrderStatus === "string"
                                        ? (JSON.parse(matched.currentOrderStatus) as { orderId: number }[])
                                        : (matched.currentOrderStatus as unknown as { orderId: number }[]);

                                    return statusOrders.some((item) => item.orderId === ord.orderID);
                                } catch {
                                    return false;
                                }
                            })
                            .map((ord) => (
                                <tr key={ord.orderID}>
                                    <td>{ord.customerName}</td>
                                    <td>{ord.address}</td>
                                    <td>{ord.waNum}</td>
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