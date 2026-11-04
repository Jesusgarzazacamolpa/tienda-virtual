import { createSchema } from 'graphql-yoga';

import type { GraphQLContext } from './context.js';
import { resolvers } from './resolvers.js';
import { typeDefs } from './type-defs.js';

export type { GraphQLContext } from './context.js';

export function createGraphQLSchema() {
  return createSchema<GraphQLContext>({ typeDefs, resolvers });
}
