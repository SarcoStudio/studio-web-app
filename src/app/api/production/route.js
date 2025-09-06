import { db } from "@/lib/db";

// 🔹 GET: Fetch all production info
export async function GET() {
  try {
    const result = await pool.query("SELECT * FROM production_info ORDER BY product_id ASC");
    return new Response(JSON.stringify(result.rows), { status: 200 });
  } catch (error) {
    console.error("❌ Fetch Production Info Error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch production information" }), { status: 500 });
  }
}

// 🔹 POST: Insert a new production record
export async function POST(req) {
  try {
    const { 
      product_id, 
      product_name, 
      product_desc, 
      product_group, 
      mach_name, 
      mach_dep, 
      mach_id, 
      signal_mult, 
      production_target 
    } = await req.json();

    if (!product_id || !product_name) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }
    
    const query = `
      INSERT INTO production_info (
        product_id, 
        product_name, 
        product_desc, 
        product_group, 
        mach_name, 
        mach_dep, 
        mach_id, 
        signal_mult, 
        production_target
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;
    `;
    const values = [
      product_id, 
      product_name, 
      product_desc || null, 
      product_group || null, 
      mach_name || null, 
      mach_dep || null, 
      mach_id || null, 
      signal_mult || null, 
      production_target || null
    ];
    const result = await pool.query(query, values);
    return new Response(JSON.stringify(result.rows[0]), { status: 201 });
  } catch (error) {
    console.error("❌ Insert Production Info Error:", error);
    console.error("Details:", error.message);
    return new Response(JSON.stringify({ error: "Failed to insert production information" }), { status: 500 });
  }
}

// 🔹 PUT: Update an existing production record
export async function PUT(req) {
  try {
    // Get and log the request body
    const body = await req.json();
    console.log("Update request body:", body);
    
    // Extract fields
    const { 
      product_id, 
      product_name, 
      product_desc, 
      product_group, 
      mach_name, 
      mach_dep, 
      mach_id, 
      signal_mult, 
      production_target 
    } = body;
    
    if (!product_id) {
      return new Response(JSON.stringify({ error: "Missing product_id for update" }), { status: 400 });
    }
    
    const query = `
      UPDATE production_info
      SET 
        product_name = $1, 
        product_desc = $2, 
        product_group = $3, 
        mach_name = $4, 
        mach_dep = $5, 
        mach_id = $6, 
        signal_mult = $7, 
        production_target = $8
      WHERE product_id = $9 RETURNING *;
    `;
    
    const values = [
      product_name || null, 
      product_desc || null, 
      product_group || null, 
      mach_name || null, 
      mach_dep || null, 
      mach_id || null, 
      signal_mult || null, 
      production_target || null, 
      product_id
    ];
    
    console.log("Query values:", values);
    
    const result = await pool.query(query, values);
    
    if (result.rowCount === 0) {
      return new Response(JSON.stringify({ error: "No production record found to update" }), { status: 404 });
    }
    
    return new Response(JSON.stringify({ 
      message: "Production record updated successfully", 
      data: result.rows[0] 
    }), { status: 200 });
  } catch (error) {
    // Log the full error
    console.error("❌ Update Production Info Error:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    // Return error info
    return new Response(JSON.stringify({ 
      error: "Failed to update production information",
      details: error.message
    }), { status: 500 });
  }
}

// 🔹 DELETE: Remove a production record
export async function DELETE(req) {
  try {
    const { product_id } = await req.json();
    if (!product_id) {
      return new Response(JSON.stringify({ error: "Missing product_id" }), { status: 400 });
    }
    await pool.query("DELETE FROM production_info WHERE product_id = $1", [product_id]);
    return new Response(JSON.stringify({ message: "Production record deleted successfully" }), { status: 200 });
  } catch (error) {
    console.error("❌ Delete Production Info Error:", error);
    return new Response(JSON.stringify({ error: "Failed to delete production record" }), { status: 500 });
  }
}