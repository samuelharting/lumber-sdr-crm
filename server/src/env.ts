export const env = {
  DATABASE_URL: process.env['DATABASE_URL'] || 'file:./data/database.db',
  PORT: parseInt(process.env['PORT'] || '3030', 10),
};