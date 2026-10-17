"use server";

import db from "@/lib/db"; // Update this path to match where your db.ts is located

export async function checkDbConnection() {
    try {
        const connection = await db.getConnection();
        await connection.ping(); // Checks if MySQL is responsive
        connection.release();    // Always release back to the pool
        
        return { 
            connected: true, 
            message: "Connected to omixelo_crm" 
        };
    } catch (error: any) {
        return { 
            connected: false, 
            message: error.message || "Database connection failed" 
        };
    }
}