import { createApp } from './app.js';
import { openDatabase } from './db/database.js';

const port = Number(process.env['PORT'] ?? 4500);
const db = openDatabase();
const app = createApp(db);

const server = app.listen(port, () => {
  console.log(`[orbita-admin-api] GraphQL en http://localhost:${port}/graphql`);
});

function shutdown() {
  server.close(() => {
    db.close();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
