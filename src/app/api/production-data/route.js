import pool from "@/lib/db";

// 🔹 GET: Fetch all production data
export async function GET() {
  try {
    const result = await pool.query("SELECT * FROM production_data ORDER BY start_time DESC");
    return new Response(JSON.stringify(result.rows), { status: 200 });
  } catch (error) {
    console.error("❌ Fetch Production Data Error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch production data" }), { status: 500 });
  }
}

// 🔹 POST: Insert new production data
export async function POST(req) {
  try {
    // Get the complete request body for logging
    const requestData = await req.json();
    console.log("Received production data:", requestData);
    
    // Extract expected fields
    const { 
      user_id, 
      mach_dep, 
      mach_name, 
      shift_plan, 
      prod_id, 
      prod_name,
      end_time,
      status,
      notes,
      quantity  // This will be mapped to qty_goal
    } = requestData;

    // Validate required fields
    const requiredFields = ['user_id', 'mach_dep', 'mach_name', 'shift_plan', 'prod_id', 'prod_name'];
    const missingFields = requiredFields.filter(field => !requestData[field]);
    
    if (missingFields.length > 0) {
      console.error("Missing required fields:", missingFields);
      return new Response(JSON.stringify({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      }), { status: 400 });
    }

    const query = `
      INSERT INTO production_data (
        user_id, 
        mach_dep, 
        mach_name, 
        shift_plan, 
        prod_id, 
        prod_name,
        start_time,
        end_time,
        status,
        notes,
        qty_goal,
        qty_achieved
      ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, $7, $8, $9, $10, $11) RETURNING *;
    `;

    // Convert quantity to number for qty_goal
    const qtyGoal = quantity ? parseInt(quantity) : null;

    const values = [
      user_id, 
      mach_dep, 
      mach_name, 
      shift_plan, 
      prod_id, 
      prod_name,
      end_time || null,
      status || 'running',
      notes || null,
      qtyGoal,
      null  // qty_achieved starts as null
    ];

    console.log("SQL query:", query);
    console.log("SQL values:", values);

    const result = await pool.query(query, values);
    console.log("Database response:", result.rows[0]);

    return new Response(JSON.stringify(result.rows[0]), { status: 201 });
  } catch (error) {
    console.error("❌ Insert Production Data Error:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    console.error("Error stack:", error.stack);
    
    if (error.detail) {
      console.error("SQL error detail:", error.detail);
    }
    
    return new Response(JSON.stringify({ 
      error: "Failed to insert production data",
      code: error.code || "unknown",
      details: error.message,
      sqlDetail: error.detail || "No detail available"
    }), { status: 500 });
  }
}

// 🔹 PUT: Update production data status
export async function PUT(req) {
  try {
    const requestData = await req.json();
    console.log("Update request data:", requestData);
    
    const { id, status, notes, qty_achieved } = requestData;

    if (!id) {
      return new Response(JSON.stringify({ error: "Missing id for update" }), { status: 400 });
    }

    // Build the query dynamically based on what fields are provided
    let setClause = [];
    let values = [];
    let paramIndex = 1;

    if (status !== undefined) {
      setClause.push(`status = $${paramIndex}`);
      values.push(status);
      paramIndex++;
    }

    if (notes !== undefined) {
      setClause.push(`notes = $${paramIndex}`);
      values.push(notes);
      paramIndex++;
    }

    // Add qty_achieved if provided
    if (qty_achieved !== undefined) {
      setClause.push(`qty_achieved = $${paramIndex}`);
      values.push(qty_achieved);
      paramIndex++;
    }

    // If no fields to update, return an error
    if (setClause.length === 0) {
      return new Response(JSON.stringify({ error: "No fields to update" }), { status: 400 });
    }

    // Handle end_time:
    // 1. If end_time is explicitly provided, use it
    // 2. If status is being changed to 'finished' or 'stopped', set end_time to current time
    if (requestData.end_time) {
      setClause.push(`end_time = $${paramIndex}`);
      values.push(requestData.end_time);
      paramIndex++;
    } else if (status === 'finished' || status === 'stopped' || status === 'completed') {
      setClause.push(`end_time = CURRENT_TIMESTAMP`);
    }

    // Add the id parameter at the end of values array
    values.push(id);

    const query = `
      UPDATE production_data
      SET ${setClause.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *;
    `;

    console.log("Update SQL query:", query);
    console.log("Update SQL values:", values);

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return new Response(JSON.stringify({ error: "No production record found to update" }), { status: 404 });
    }

    return new Response(JSON.stringify({ 
      message: "Production record updated successfully", 
      data: result.rows[0] 
    }), { status: 200 });
  } catch (error) {
    console.error("❌ Update Production Data Error:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    
    return new Response(JSON.stringify({ 
      error: "Failed to update production data",
      code: error.code || "unknown",
      details: error.message,
      sqlDetail: error.detail || "No detail available"
    }), { status: 500 });
  }
}

// 🔹 DELETE: Remove a production record
export async function DELETE(req) {
  try {
    const { id } = await req.json();
    
    if (!id) {
      return new Response(JSON.stringify({ error: "Missing id" }), { status: 400 });
    }
    
    await pool.query("DELETE FROM production_data WHERE id = $1", [id]);
    
    return new Response(JSON.stringify({ message: "Production record deleted successfully" }), { status: 200 });
  } catch (error) {
    console.error("❌ Delete Production Data Error:", error);
    return new Response(JSON.stringify({ error: "Failed to delete production record" }), { status: 500 });
  }
}