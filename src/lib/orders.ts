"use server";

import db from '@/lib/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

export interface Orders extends RowDataPacket{
    orderID: number;
    customerName: string;
    waNum: string;
    altNum: string;
    address: string;
    orderDate: Date;
    orderTime: string;
    orderItems: string;
    totalPrice: number;
}

export interface  OrderStatus extends RowDataPacket{
    statusId: number;
    status: string;
    currentOrderStatus: JSON | null;
}

export async function getAllOrders(): Promise<Orders[]> {
    try {
        const [rows] = await db.query<Orders[]>(`SELECT * FROM orders`);
        return rows
    }
    catch(error){
        throw error;
    }
}

export async function getAllOrderStatus(): Promise<OrderStatus[]> {
    try {
        const [rows] = await db.query<OrderStatus[]>(`SELECT * FROM orderStatus`);
        return rows
    }
    catch(error){
        throw error;
    }
}