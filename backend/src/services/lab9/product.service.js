export async function getAll(db, q) {
  const { rows } = await db.query(
    "SELECT * FROM lab9.products WHERE $1::text IS NULL OR strpos(lower(title), lower($1)) > 0 ORDER BY id DESC",
    [q?.trim() ?? null],
  );
  return rows;
}

export async function getOne(db, id) {
  const { rows } = await db.query("SELECT * FROM lab9.products WHERE id = $1::bigint", [id]);
  return rows[0];
}

export async function create(db, { title, price, amount }) {
  const { rows } = await db.query(
    "INSERT INTO lab9.products (title, price, amount) VALUES ($1, $2, $3) RETURNING *",
    [title.trim(), price, amount],
  );
  return rows[0];
}

export async function update(db, id, { title, price, amount }) {
  const { rows } = await db.query(
    "UPDATE lab9.products SET title = COALESCE($1, title), price = COALESCE($2, price), amount = COALESCE($3, amount) WHERE id = $4::bigint RETURNING *",
    [title?.trim(), price, amount, id],
  );
  return rows[0];
}

export async function remove(db, id) {
  const { rows } = await db.query("DELETE FROM lab9.products WHERE id = $1::bigint RETURNING id", [id]);
  return rows[0];
}

export async function stock(db) {
  const { rows: [totals] } = await db.query(
    "SELECT COUNT(*) AS total_products, COALESCE(SUM(amount), 0) AS total_items, COALESCE(SUM(price::bigint * amount), 0) AS total_value FROM lab9.products",
  );
  return Object.fromEntries(Object.entries(totals).map(([key, value]) => [key, Number(value)]));
}
