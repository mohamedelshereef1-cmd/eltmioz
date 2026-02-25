import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    const result = await sql`SELECT NOW()`;
    res.status(200).json({
      message: "Database connected ✅",
      time: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({
      error: "Database failed ❌",
      details: err.message
    });
  }
}