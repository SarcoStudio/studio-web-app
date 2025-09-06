import pool from "@/lib/db";

// 🔹 GET: Fetch a specific production data record by ID
export async function GET(req, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return new Response(JSON.stringify({ error: "Missing ID parameter" }), { status: 400 });
    }
    
    const result = await pool.query("SELECT * FROM production_data WHERE id = $1", [id]);
    
    if (result.rows.length === 0) {
      return new Response(JSON.stringify({ error: "Production record not found" }), { status: 404 });
    }
    
    return new Response(JSON.stringify(result.rows[0]), { status: 200 });
  } catch (error) {
    console.error("❌ Fetch Production Data by ID Error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch production data" }), { status: 500 });
  }
}

// 🔹 PUT: Update a specific production data record
export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const updates = await req.json();
    console.log("Updating production ID:", id, "with data:", updates);
    
    if (!id) {
      return new Response(JSON.stringify({ error: "Missing ID parameter" }), { status: 400 });
    }
    
    // Build dynamic update query based on provided fields
    const updateFields = [];
    const values = [];
    let paramIndex = 1;
    
    // Add each field to the update query
    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'id') { // Skip the id field
        updateFields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }
    
    // Handle specific case for status changes
    if (updates.status === 'finished' || updates.status === 'stopped' || updates.status === 'completed') {
      // Only set end_time if it's not explicitly provided
      if (!updates.end_time) {
        updateFields.push(`end_time = CURRENT_TIMESTAMP`);
      }
    }
    
    // If no fields to update, return error
    if (updateFields.length === 0) {
      return new Response(JSON.stringify({ error: "No fields to update" }), { status: 400 });
    }
    
    // Add the id parameter
    values.push(id);
    
    const query = `
      UPDATE production_data
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *;
    `;
    
    console.log("Update query:", query);
    console.log("Update values:", values);
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return new Response(JSON.stringify({ error: "Production record not found" }), { status: 404 });
    }
    
    return new Response(JSON.stringify({ 
      message: "Production record updated successfully", 
      data: result.rows[0] 
    }), { status: 200 });
  } catch (error) {
    console.error("❌ Update Production Data by ID Error:", error);
    console.error("Error details:", error.message);
    console.error("Error code:", error.code);
    
    return new Response(JSON.stringify({ 
      error: "Failed to update production data",
      details: error.message,
      code: error.code
    }), { status: 500 });
  }
}

// 🔹 DELETE: Remove a specific production data record
export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return new Response(JSON.stringify({ error: "Missing ID parameter" }), { status: 400 });
    }
    
    const result = await pool.query("DELETE FROM production_data WHERE id = $1 RETURNING *", [id]);
    
    if (result.rows.length === 0) {
      return new Response(JSON.stringify({ error: "Production record not found" }), { status: 404 });
    }
    
    return new Response(JSON.stringify({ 
      message: "Production record deleted successfully",
      data: result.rows[0]
    }), { status: 200 });
  } catch (error) {
    console.error("❌ Delete Production Data by ID Error:", error);
    return new Response(JSON.stringify({ error: "Failed to delete production record" }), { status: 500 });
  }
}