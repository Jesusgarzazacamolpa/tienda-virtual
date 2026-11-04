import { afterEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { DatabaseSync } from 'node:sqlite';

import { graphql } from 'graphql';

import { openDatabase } from '../db/database.js';
import type { Product } from '../models/types.js';
import { createGraphQLSchema } from './schema.js';

const schema = createGraphQLSchema();
const openDatabases: DatabaseSync[] = [];

function setup() {
  const db = openDatabase(':memory:');
  openDatabases.push(db);

  const run = (source: string, variableValues?: Record<string, unknown>, authenticated = true) =>
    graphql({
      schema,
      source,
      variableValues,
      contextValue: { db, authenticated }
    });

  return { run };
}

afterEach(() => {
  for (const db of openDatabases.splice(0)) db.close();
});

const validInput = {
  name: 'Terra Bowl',
  category: 'HOGAR',
  price: 450,
  compareAtPrice: null,
  stock: 12,
  badge: 'Nuevo',
  tagline: 'Bol de cerámica para la mesa diaria',
  description: 'Un bol de cerámica hecho a mano, pensado para ensaladas y desayunos.',
  image: '/products/terra-cup.webp',
  colors: [{ name: 'Arena', hex: '#d6c8b2' }],
  active: true
};

describe('API GraphQL de administración', () => {
  it('rechaza consultas sin token', async () => {
    const { run } = setup();
    const result = await run('{ products { id } }', undefined, false);

    assert.equal(result.errors?.[0]?.extensions?.['code'], 'UNAUTHENTICATED');
  });

  it('lista y busca productos del catálogo sembrado', async () => {
    const { run } = setup();

    const all = await run('{ products { id name category active } }');
    const products = (all.data as { products: Product[] }).products;
    assert.equal(products.length, 8);
    assert.ok(products.every((item) => item.active));

    const filtered = await run(
      'query ($category: Category) { products(category: $category) { name } }',
      { category: 'HOGAR' }
    );
    const home = (filtered.data as { products: { name: string }[] }).products;
    assert.deepEqual(
      home.map((item) => item.name),
      ['Lumen Arc', 'Form Chair', 'Terra Cup']
    );

    const searched = await run('query ($search: String) { products(search: $search) { name } }', {
      search: 'lampara'
    });
    const matches = (searched.data as { products: { name: string }[] }).products;
    assert.deepEqual(
      matches.map((item) => item.name),
      ['Lumen Arc']
    );
  });

  it('crea un producto y resuelve slugs duplicados', async () => {
    const { run } = setup();
    const mutation = `
      mutation ($input: ProductInput!) {
        createProduct(input: $input) {
          id
          slug
          name
          stock
          colors { name hex }
          active
        }
      }
    `;

    const first = await run(mutation, { input: validInput });
    const created = (
      first.data as { createProduct: { id: string; slug: string; name: string; stock: number } }
    ).createProduct;
    assert.match(created.id, /^p-[0-9a-f]{8}$/);
    assert.equal(created.slug, 'terra-bowl');
    assert.equal(created.name, 'Terra Bowl');
    assert.equal(created.stock, 12);

    const second = await run(mutation, { input: validInput });
    const duplicated = (second.data as { createProduct: { slug: string } }).createProduct;
    assert.equal(duplicated.slug, 'terra-bowl-2');

    const list = await run('query ($search: String) { products(search: $search) { name } }', {
      search: 'terra bowl'
    });
    assert.equal((list.data as { products: unknown[] }).products.length, 2);
  });

  it('rechaza datos inválidos y precios anteriores incoherentes', async () => {
    const { run } = setup();
    const mutation = `mutation ($input: ProductInput!) { createProduct(input: $input) { id } }`;

    const invalidPrice = await run(mutation, { input: { ...validInput, price: 0 } });
    assert.equal(invalidPrice.errors?.[0]?.extensions?.['code'], 'BAD_USER_INPUT');
    assert.match(invalidPrice.errors?.[0]?.message ?? '', /precio/);

    const invalidColors = await run(mutation, { input: { ...validInput, colors: [] } });
    assert.match(invalidColors.errors?.[0]?.message ?? '', /al menos un color/);

    const invalidCompare = await run(mutation, {
      input: { ...validInput, price: 500, compareAtPrice: 400 }
    });
    assert.match(invalidCompare.errors?.[0]?.message ?? '', /precio anterior/);
  });

  it('actualiza un producto sin cambiar su slug', async () => {
    const { run } = setup();

    const result = await run(
      `mutation ($id: ID!, $input: ProductInput!) {
        updateProduct(id: $id, input: $input) {
          id
          slug
          stock
          active
        }
      }`,
      {
        id: 'p-terra-cup',
        input: {
          ...validInput,
          name: 'Terra Cup',
          tagline: 'Taza de cerámica hecha a mano',
          description:
            'Cada taza se tornea a mano y se cuece en horno de alta temperatura. El esmalte mate hace única a cada pieza.',
          image: '/products/terra-cup.webp',
          price: 420,
          stock: 7,
          active: false
        }
      }
    );

    const updated = (
      result.data as { updateProduct: { slug: string; stock: number; active: boolean } }
    ).updateProduct;
    assert.equal(updated.slug, 'terra-cup');
    assert.equal(updated.stock, 7);
    assert.equal(updated.active, false);

    const active = await run('{ products(active: true) { id } }');
    assert.equal((active.data as { products: unknown[] }).products.length, 7);
  });

  it('lista pedidos, filtra por estado y devuelve el detalle', async () => {
    const { run } = setup();

    const all = await run(`
      query {
        orders {
          id
          status
          total
          paymentMethod
          customer { fullName }
          lines { name quantity }
        }
      }
    `);
    const orders = (
      all.data as {
        orders: {
          id: string;
          status: string;
          total: number;
          paymentMethod: string;
          lines: unknown[];
        }[];
      }
    ).orders;
    assert.equal(orders.length, 4);
    assert.equal(orders[0]?.id, 'ORD-D4E5F6');
    assert.equal(orders[0]?.paymentMethod, 'TRANSFER');
    assert.equal(orders[0]?.lines.length, 2);

    const paid = await run(
      'query ($status: OrderStatus) { orders(status: $status) { id status } }',
      { status: 'PAID' }
    );
    const paidOrders = (paid.data as { orders: { id: string; status: string }[] }).orders;
    assert.deepEqual(
      paidOrders.map((order) => ({ id: order.id, status: order.status })),
      [{ id: 'ORD-A1B2C3', status: 'PAID' }]
    );

    const detail = await run(`
      query {
        order(id: "ORD-G7H8I9") {
          id
          customer { fullName city }
          lines { name quantity unitPrice }
          total
        }
      }
    `);
    const order = (
      detail.data as {
        order: {
          customer: { fullName: string; city: string };
          lines: unknown[];
          total: number;
        };
      }
    ).order;
    assert.equal(order.customer.fullName, 'Sofía Ramírez');
    assert.equal(order.customer.city, 'Ciudad de México');
    assert.equal(order.lines.length, 2);
    assert.equal(order.total, 8490);
  });
});
