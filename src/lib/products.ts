"use server";

import db from "@/lib/db";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";

export interface ProductRow extends RowDataPacket {
    pId: number;
    pName: string;
    pImage: Buffer | null;
    pDescribe: string;
    pPrice: number;
    pStock: number;
    categoryId: number;
}

export interface Products {
    pId: number;
    pName: string;
    pImage: Uint8Array | null;
    pDescribe: string;
    pPrice: number;
    pStock: number;
    categoryId: number;
}

export async function getAllProducts(): Promise<Products[]> {
    try {
        const [rows] = await db.query<ProductRow[]>("SELECT * FROM products");
        
        // Convert each RowDataPacket & Buffer into a plain object + pure Uint8Array
        return rows.map((row) => ({
            pId: row.pId,
            pName: row.pName,
            pImage: row.pImage ? new Uint8Array(row.pImage) : null,
            pDescribe: row.pDescribe,
            pPrice: row.pPrice,
            pStock: row.pStock,
            categoryId: row.categoryId,
        }));
    } catch (error) {
        throw error;
    }
}