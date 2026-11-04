import { GraphQLError } from 'graphql';

import type { Category, Order, OrderStatus, ProductDraft } from '../models/types.js';
import type { GraphQLContext } from './context.js';
import { getOrder, listOrders } from '../services/order-repository.js';
import {
  createProduct,
  getProduct,
  listProducts,
  updateProduct
} from '../services/product-repository.js';
import { parseProductDraft } from './validation.js';

interface ProductsArgs {
  search?: string | null;
  category?: Category | null;
  active?: boolean | null;
}

interface ByIdArgs {
  id: string;
}

interface OrdersArgs {
  status?: OrderStatus | null;
}

interface CreateProductArgs {
  input: unknown;
}

interface UpdateProductArgs {
  id: string;
  input: unknown;
}

function requireAuth(context: GraphQLContext): void {
  if (!context.authenticated) {
    throw new GraphQLError('Necesitas un token de administrador válido.', {
      extensions: { code: 'UNAUTHENTICATED' }
    });
  }
}

function parseInput(input: unknown): ProductDraft {
  const result = parseProductDraft(input);
  if (result.success) return result.data;

  throw new GraphQLError(result.message, {
    extensions: { code: 'BAD_USER_INPUT', issues: result.issues }
  });
}

export const resolvers = {
  Query: {
    products: (_parent: unknown, args: ProductsArgs, context: GraphQLContext) => {
      requireAuth(context);
      return listProducts(context.db, {
        search: args.search ?? null,
        category: args.category ?? null,
        active: args.active ?? null
      });
    },
    product: (_parent: unknown, args: ByIdArgs, context: GraphQLContext) => {
      requireAuth(context);
      return getProduct(context.db, args.id);
    },
    orders: (_parent: unknown, args: OrdersArgs, context: GraphQLContext) => {
      requireAuth(context);
      return listOrders(context.db, args.status ?? null);
    },
    order: (_parent: unknown, args: ByIdArgs, context: GraphQLContext) => {
      requireAuth(context);
      return getOrder(context.db, args.id);
    }
  },
  Mutation: {
    createProduct: (_parent: unknown, args: CreateProductArgs, context: GraphQLContext) => {
      requireAuth(context);
      return createProduct(context.db, parseInput(args.input));
    },
    updateProduct: (_parent: unknown, args: UpdateProductArgs, context: GraphQLContext) => {
      requireAuth(context);
      const updated = updateProduct(context.db, args.id, parseInput(args.input));
      if (!updated) {
        throw new GraphQLError('El producto no existe.', {
          extensions: { code: 'NOT_FOUND' }
        });
      }
      return updated;
    }
  },
  Order: {
    paymentMethod: (order: Order) => (order.paymentMethod === 'card' ? 'CARD' : 'TRANSFER')
  }
};
