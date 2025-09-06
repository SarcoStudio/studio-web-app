import pool from "@/lib/db";

// GET: Fetch all shifts
export async function GET() {
  try {
    const result = await pool.query("SELECT * FROM shift_info ORDER BY shift_id ASC");
    return new Response(JSON.stringify(result.rows), { status: 200 });
  } catch (error) {
    console.error("Fetch Shifts Error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch shifts" }), { status: 500 });
  }
}

// POST: Insert a new shift
export async function POST(req) {
  try {
    const { shift_desc, start_time, end_time, spans_next_day } = await req.json();

    if (!shift_desc || !start_time || !end_time) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }
    
    const query = `
      INSERT INTO shift_info (shift_desc, start_time, end_time, spans_next_day)
      VALUES ($1, $2, $3, $4) RETURNING *;
    `;
    const values = [shift_desc, start_time, end_time, spans_next_day || false];
    const result = await pool.query(query, values);
    
    return new Response(JSON.stringify(result.rows[0]), { status: 201 });
  } catch (error) {
    console.error("Insert Shift Error:", error);
    return new Response(JSON.stringify({ error: "Failed to insert shift" }), { status: 500 });
  }
}