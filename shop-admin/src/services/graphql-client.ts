import type { Product, ProductInput } from '@/models/catalog';
import type { Order } from '@/models/order';

const API_ENDPOINT = import.meta.env['VITE_API_URL'] ?? '/graphql';

interface GraphQLIssue {
  path: string;
  message: string;
}

interface GraphQLErrorPayload {
  message: string;
  extensions?: {
    code?: string;
    issues?: GraphQLIssue[];
  };
}

interface GraphQLEnvelope<T> {
  data?: T | null;
  errors?: GraphQLErrorPayload[];
}

export class GraphQLRequestError extends Error {
  readonly code: string | null;
  readonly issues: GraphQLIssue[];

  constructor(message: string, code: string | null = null, issues: GraphQLIssue[] = []) {
    super(message);
    this.name = 'GraphQLRequestError';
    this.code = code;
    this.issues = issues;
  }
}

const PRODUCT_FIELDS = /* GraphQL */ `
  fragment ProductFields on Product {
    id
    slug
    name
    category
    price
    compareAtPrice
    stock
    badge
    tagline
    description
    image
    colors {
      name
      hex
    }
    active
    createdAt
  }
`;

const ORDER_FIELDS = /* GraphQL */ `
  fragment OrderFields on Order {
    id
    createdAt
    estimatedDelivery
    customer {
      fullName
      email
      phone
      address
      city
      state
      postalCode
    }
    paymentMethod
    status
    lines {
      productId
      name
      color
      quantity
      unitPrice
    }
    subtotal
    shipping
    total
  }
`;

const PRODUCTS_QUERY = /* GraphQL */ `
  ${PRODUCT_FIELDS}
  query Products {
    products {
      ...ProductFields
    }
  }
`;

const ORDERS_QUERY = /* GraphQL */ `
  ${ORDER_FIELDS}
  query Orders {
    orders {
      ...OrderFields
    }
  }
`;

const CREATE_PRODUCT_MUTATION = /* GraphQL */ `
  ${PRODUCT_FIELDS}
  mutation CreateProduct($input: ProductInput!) {
    createProduct(input: $input) {
      ...ProductFields
    }
  }
`;

const UPDATE_PRODUCT_MUTATION = /* GraphQL */ `
  ${PRODUCT_FIELDS}
  mutation UpdateProduct($id: ID!, $input: ProductInput!) {
    updateProduct(id: $id, input: $input) {
      ...ProductFields
    }
  }
`;

const VERIFY_QUERY = /* GraphQL */ `
  query VerifyAccess {
    products {
      id
    }
  }
`;

async function request<T>(
  token: string,
  query: string,
  variables: Record<string, unknown>,
  onUnauthorized: () => void
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ query, variables })
    });
  } catch {
    throw new GraphQLRequestError(
      'No se pudo contactar con la API. Revisa que el servidor esté activo en el puerto 4500.'
    );
  }

  if (!response.ok) {
    throw new GraphQLRequestError(`La API respondió con el estado ${response.status}.`);
  }

  const payload = (await response.json()) as GraphQLEnvelope<T>;
  const firstError = payload.errors?.[0];

  if (firstError) {
    if (firstError.extensions?.code === 'UNAUTHENTICATED') onUnauthorized();

    throw new GraphQLRequestError(
      firstError.message,
      firstError.extensions?.code ?? null,
      firstError.extensions?.issues ?? []
    );
  }

  if (!payload.data) {
    throw new GraphQLRequestError('La API devolvió una respuesta vacía.');
  }

  return payload.data;
}

export interface AdminApi {
  readonly token: string;
  products(): Promise<Product[]>;
  orders(): Promise<Order[]>;
  createProduct(input: ProductInput): Promise<Product>;
  updateProduct(id: string, input: ProductInput): Promise<Product>;
}

export function createAdminApi(token: string, onUnauthorized: () => void): AdminApi {
  return {
    token,
    async products() {
      const data = await request<{ products: Product[] }>(
        token,
        PRODUCTS_QUERY,
        {},
        onUnauthorized
      );
      return data.products;
    },
    async orders() {
      const data = await request<{ orders: Order[] }>(token, ORDERS_QUERY, {}, onUnauthorized);
      return data.orders;
    },
    async createProduct(input) {
      const data = await request<{ createProduct: Product }>(
        token,
        CREATE_PRODUCT_MUTATION,
        { input },
        onUnauthorized
      );
      return data.createProduct;
    },
    async updateProduct(id, input) {
      const data = await request<{ updateProduct: Product }>(
        token,
        UPDATE_PRODUCT_MUTATION,
        { id, input },
        onUnauthorized
      );
      return data.updateProduct;
    }
  };
}

export async function verifyAdminToken(token: string): Promise<void> {
  await request<{ products: { id: string }[] }>(token, VERIFY_QUERY, {}, () => undefined);
}
