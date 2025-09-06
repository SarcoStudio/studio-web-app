import { db } from "@/lib/db";

// 🔹 GET: Fetch all machines
export async function GET() {
  try {
    const result = await pool.query("SELECT * FROM machine_info ORDER BY mach_id ASC");
    return new Response(JSON.stringify(result.rows), { status: 200 });
  } catch (error) {
    console.error("❌ Fetch Machines Error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch machines" }), { status: 500 });
  }
}

// 🔹 POST: Insert new machine
export async function POST(req) {
  try {
    const { unit_id, gpio_num, field_id, mach_dep, mach_name, refresh_int, target_good, target_acceptable, target_bad } = await req.json();

    if (!unit_id || !gpio_num || !field_id || !mach_name) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    const mach_id = `${unit_id}-${field_id}`; // Generate mach_id

    const query = `
      INSERT INTO machine_info (unit_id, gpio_num, field_id, mach_id, mach_dep, mach_name, refresh_int, target_good, target_acceptable, target_bad)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *;
    `;

    const values = [unit_id, gpio_num, field_id, mach_id, mach_dep, mach_name, refresh_int, target_good, target_acceptable, target_bad];

    const result = await pool.query(query, values);

    return new Response(JSON.stringify(result.rows[0]), { status: 201 });
  } catch (error) {
    console.error("❌ Insert Machine Error:", error);
    return new Response(JSON.stringify({ error: "Failed to insert machine" }), { status: 500 });
  }
}

// 🔹 PUT: Update an existing machine
export async function PUT(req) {
  try {
    const { mach_id, unit_id, field_id, mach_dep, mach_name } = await req.json();

    if (!mach_id) {
      return new Response(JSON.stringify({ error: "Missing mach_id for update" }), { status: 400 });
    }

    const query = `
      UPDATE machine_info
      SET unit_id = $1, field_id = $2, mach_dep = $3, mach_name = $4
      WHERE mach_id = $5 RETURNING *;
    `;

    const values = [unit_id, field_id, mach_dep, mach_name, mach_id];

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return new Response(JSON.stringify({ error: "No machine found to update" }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: "Machine updated successfully", data: result.rows[0] }), { status: 200 });
  } catch (error) {
    console.error("❌ Update Machine Error:", error);
    return new Response(JSON.stringify({ error: "Failed to update machine" }), { status: 500 });
  }
}

// 🔹 DELETE: Remove a machine
export async function DELETE(req) {
  try {
    const { mach_id } = await req.json();

    if (!mach_id) {
      return new Response(JSON.stringify({ error: "Missing mach_id" }), { status: 400 });
    }

    await pool.query("DELETE FROM machine_info WHERE mach_id = $1", [mach_id]);

    return new Response(JSON.stringify({ message: "Machine deleted successfully" }), { status: 200 });
  } catch (error) {
    console.error("❌ Delete Machine Error:", error);
    return new Response(JSON.stringify({ error: "Failed to delete machine" }), { status: 500 });
  }
}
