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

export type CreateProductInput = Omit<Products, "pId">;

export async function getAllProducts(): Promise<Products[]> {
    try {
        const [rows] = await db.query<ProductRow[]>("SELECT * FROM products");
        
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

export async function createProduct(product: CreateProductInput): Promise<number> {
    try{
        const query = `INSERT INTO products (pName, pImage, pDescribe, pPrice, pStock, categoryId) VALUES (?, ?, ?, ?, ?, ?)`;
        const imageBuffer = product.pImage ? Buffer.from(product.pImage) : null;
        const [result] = await db.query<ResultSetHeader>(query, [product.pName, imageBuffer, product.pDescribe, product.pPrice, product.pStock, product.categoryId]);
        return result.insertId;
    }catch(error){
        throw error;
    }
}

export async function updateProduct(product: Products): Promise<boolean> {
    const query = `
        UPDATE products 
        SET pName = ?, 
            pImage = ?, 
            pDescribe = ?, 
            pPrice = ?, 
            pStock = ?, 
            categoryId = ?
        WHERE pId = ?
    `;

    const imageBuffer = product.pImage ? Buffer.from(product.pImage) : null;

    const values = [
        product.pName,
        imageBuffer,
        product.pDescribe,
        product.pPrice,
        product.pStock,
        product.categoryId,
        product.pId
    ];

    const [result] = await db.query<ResultSetHeader>(query, values);

    return result.affectedRows > 0;
}

export async function removeProduct(productId: number) {
    const query = `DELETE FROM products WHERE pId = ?`;
    const [result] = await db.query<ResultSetHeader>(query, [productId]);
    return result.affectedRows > 0;
}