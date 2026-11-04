import type { DatabaseSync } from 'node:sqlite';

export interface GraphQLContext {
  db: DatabaseSync;
  authenticated: boolean;
}
