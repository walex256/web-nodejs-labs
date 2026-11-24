function shortages(items, rows) {
  const products = new Map(rows.map(product => [product.id, product]));
  return items.flatMap(({ id, quantity }) => {
    const product = products.get(id);
    const available = product?.amount ?? 0;
    return available < quantity ? [{ id, title: product?.title, requested: quantity, available }] : [];
  });
}

async function findProducts(db, items) {
  const { rows } = await db.query("SELECT * FROM lab9.products WHERE id = ANY($1::int[])", [
    items.map(item => item.id),
  ]);
  return rows;
}

export async function check(db, items) {
  return shortages(items, await findProducts(db, items));
}

export async function buy(db, items) {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    // Одинаковый порядок блокировок для параллельных заказов.
    const ordered = [...items].sort((a, b) => a.id - b.id);
    const products = [];
    for (const { id, quantity } of ordered) {
      const { rows } = await client.query(
        "UPDATE lab9.products SET amount = amount - $1 WHERE id = $2 AND amount >= $1 RETURNING *",
        [quantity, id],
      );
      if (!rows.length) {
        const [product] = await findProducts(client, [{ id }]);
        await client.query("ROLLBACK");
        return { shortages: [{ id, title: product?.title, requested: quantity, available: product?.amount ?? 0 }] };
      }
      products.push({ ...rows[0], quantity });
    }
    await client.query("COMMIT");
    return { products, total: products.reduce((sum, item) => sum + item.quantity * item.price, 0) };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
