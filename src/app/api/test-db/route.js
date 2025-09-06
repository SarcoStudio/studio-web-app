import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query("SELECT NOW()");
    return new Response(JSON.stringify({ success: true, time: result.rows[0] }), { status: 200 });
  } catch (error) {
    console.error("Database Connection Error:", error);
    return new Response(JSON.stringify({ error: "Failed to connect to DB" }), { status: 500 });
  }
}
