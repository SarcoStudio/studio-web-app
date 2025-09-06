import pool from "@/lib/db";

// PUT: Update a shift
export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const { shift_desc, start_time, end_time, spans_next_day } = await req.json();

    if (!shift_desc || !start_time || !end_time) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }
    
    const query = `
      UPDATE shift_info
      SET shift_desc = $1, start_time = $2, end_time = $3, spans_next_day = $4
      WHERE shift_id = $5
      RETURNING *;
    `;
    const values = [shift_desc, start_time, end_time, spans_next_day || false, id];
    const result = await pool.query(query, values);
    
    if (result.rowCount === 0) {
      return new Response(JSON.stringify({ error: "Shift not found" }), { status: 404 });
    }
    
    return new Response(JSON.stringify(result.rows[0]), { status: 200 });
  } catch (error) {
    console.error("Update Shift Error:", error);
    return new Response(JSON.stringify({ error: "Failed to update shift" }), { status: 500 });
  }
}

// DELETE: Delete a shift
export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    
    const result = await pool.query("DELETE FROM shift_info WHERE shift_id = $1 RETURNING *", [id]);
    
    if (result.rowCount === 0) {
      return new Response(JSON.stringify({ error: "Shift not found" }), { status: 404 });
    }
    
    return new Response(JSON.stringify({ message: "Shift deleted successfully" }), { status: 200 });
  } catch (error) {
    console.error("Delete Shift Error:", error);
    return new Response(JSON.stringify({ error: "Failed to delete shift" }), { status: 500 });
  }
}