import { db } from "@/lib/db";

// 🔹 GET: Fetch all products
export async function GET() {
  try {
    const result = await pool.query("SELECT * FROM product_info ORDER BY product_id ASC");
    return new Response(JSON.stringify(result.rows), { status: 200 });
  } catch (error) {
    console.error("❌ Fetch Products Error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch products" }), { status: 500 });
  }
}

// 🔹 POST: Insert a new product
export async function POST(req) {
  try {
    const { product_id, product_name, product_group, unit_size, unit_type } = await req.json();
    if (!product_id || !product_name || !product_group) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }
    
    // Let database handle product_desc automatically with its DEFAULT constraint
    const query = `
      INSERT INTO product_info (product_id, product_name, product_group, unit_size, unit_type)
      VALUES ($1, $2, $3, $4, $5) RETURNING *;
    `;
    const values = [product_id, product_name, product_group, unit_size, unit_type];
    const result = await pool.query(query, values);
    return new Response(JSON.stringify(result.rows[0]), { status: 201 });
  } catch (error) {
    console.error("❌ Insert Product Error:", error);
    console.error("Details:", error.message);
    return new Response(JSON.stringify({ error: "Failed to insert product" }), { status: 500 });
  }
}

// 🔹 PUT: Update an existing product
export async function PUT(req) {
  try {
    // Get and log the request body
    const body = await req.json();
    console.log("Update request body:", body);
    
    // Extract fields
    const { product_id, product_name, product_group, unit_size, unit_type } = body;
    
    if (!product_id) {
      return new Response(JSON.stringify({ error: "Missing product_id for update" }), { status: 400 });
    }
    
    // IMPORTANT: Do NOT update product_desc - let the database handle it
    // This is the key change to fix the error
    const query = `
      UPDATE product_info
      SET product_name = $1, product_group = $2, unit_size = $3, unit_type = $4
      WHERE product_id = $5 RETURNING *;
    `;
    
    const values = [
      product_name || null, 
      product_group || null, 
      unit_size || null, 
      unit_type || null, 
      product_id
    ];
    
    console.log("Query values:", values);
    
    const result = await pool.query(query, values);
    
    if (result.rowCount === 0) {
      return new Response(JSON.stringify({ error: "No product found to update" }), { status: 404 });
    }
    
    return new Response(JSON.stringify({ 
      message: "Product updated successfully", 
      data: result.rows[0] 
    }), { status: 200 });
  } catch (error) {
    // Log the full error
    console.error("❌ Update Product Error:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    // Return error info
    return new Response(JSON.stringify({ 
      error: "Failed to update product",
      details: error.message
    }), { status: 500 });
  }
}

// 🔹 DELETE: Remove a product
export async function DELETE(req) {
  try {
    const { product_id } = await req.json();
    if (!product_id) {
      return new Response(JSON.stringify({ error: "Missing product_id" }), { status: 400 });
    }
    await pool.query("DELETE FROM product_info WHERE product_id = $1", [product_id]);
    return new Response(JSON.stringify({ message: "Product deleted successfully" }), { status: 200 });
  } catch (error) {
    console.error("❌ Delete Product Error:", error);
    return new Response(JSON.stringify({ error: "Failed to delete product" }), { status: 500 });
  }
}