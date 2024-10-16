import bcrypt from 'bcrypt';
import {
  connectToDatabase,
  disconnectFromDatabase,
  queryClient as query,
} from '../lib/postgres';
import { invoices, customers, revenue, users } from '../lib/placeholder-data';

const sleep = (delay: number | undefined) =>
  new Promise((resolve) => setTimeout(resolve, delay));

async function seedUsers() {
  await query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `);
  await sleep(1000);
  const insertedUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return query(
        `
        INSERT INTO users (id, name, email, password)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO NOTHING;
      `,
        [user.id, user.name, user.email, hashedPassword]
      );
    })
  );

  return insertedUsers;
}

async function seedInvoices() {
  await query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

  await query(`
    CREATE TABLE IF NOT EXISTS invoices (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      customer_id UUID NOT NULL,
      amount INT NOT NULL,
      status VARCHAR(255) NOT NULL,
      date DATE NOT NULL
    );
  `);
  await sleep(1000);
  const insertedInvoices = await Promise.all(
    invoices.map((invoice) =>
      query(
        `
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO NOTHING;
      `,
        [invoice.customer_id, invoice.amount, invoice.status, invoice.date]
      )
    )
  );

  return insertedInvoices;
}

async function seedCustomers() {
  await query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

  await query(`
    CREATE TABLE IF NOT EXISTS customers2 (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      image_url VARCHAR(255) NOT NULL
    );
  `);
  await sleep(1000);
  const insertedCustomers = await Promise.all(
    customers.map((customer) => {
      query(
        `
        INSERT INTO customers2 (id, name, email, image_url) 
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO NOTHING;
      `,
        [customer.id, customer.name, customer.email, customer.image_url]
      );
    })
  );

  return insertedCustomers;
}

async function seedRevenue() {
  await query(`
    CREATE TABLE IF NOT EXISTS revenue (
      month VARCHAR(4) NOT NULL UNIQUE,
      revenue INT NOT NULL
    );
  `);
  await sleep(1000);
  const insertedRevenue = await Promise.all(
    revenue.map((rev) =>
      query(
        `
        INSERT INTO revenue (month, revenue)
        VALUES ($1, $2)
        ON CONFLICT (month) DO NOTHING;
      `,
        [rev.month, rev.revenue]
      )
    )
  );

  return insertedRevenue;
}

export async function GET() {
  try {
    await connectToDatabase();
    await query(`BEGIN`);
    await seedUsers();
    await sleep(1000);
    console.log('Success 1');
    await seedCustomers();
    await sleep(1000);
    console.log('Success 2');
    await seedInvoices();
    await sleep(1000);
    console.log('Success 3');
    await seedRevenue();
    await sleep(1000);
    console.log('Success 4');
    await query(`COMMIT`);
    await disconnectFromDatabase();

    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    await query(`ROLLBACK`);
    return Response.json({ error }, { status: 500 });
  }
}
