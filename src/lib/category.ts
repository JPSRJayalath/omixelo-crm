"use server";

import db from "@/lib/db";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";

export interface Category extends RowDataPacket {
    categoryId: number;
    categoryName: string;
}

export async function getAllCategories(): Promise<Category[]> {
    try {
        const [rows] = await db.query<Category[]>(`SELECT * FROM category`);
        return rows
    } catch (error) {
        throw error;
    }
}

export async function getCategoryById(categoryId: number): Promise<Category | null> {
    try {
        const [rows] = await db.query<Category[]>(`SELECT * FROM category WHERE category_id = ?`, [categoryId]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        throw error;
    }
}

export async function createCategory(category: string): Promise<number> {
    try{
        const query = `INSERT INTO category (categoryName) VALUES (?)`;
        const [result] = await db.query<ResultSetHeader>(query, [category]);
        return result.insertId;
    }catch(error){
        throw error;
    }
}