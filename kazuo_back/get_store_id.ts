import { connectionSource } from './src/config/typeorm';

async function getStoreId() {
  try {
    await connectionSource.initialize();
    console.log('Database connected.');

    const stores = await connectionSource.query('SELECT * FROM store LIMIT 1');
    
    if (stores.length > 0) {
      console.log('Store ID:', stores[0].id);
      console.log('Store Name:', stores[0].name);
    } else {
      console.log('No stores found in the database.');
    }

    await connectionSource.destroy();
  } catch (error) {
    console.error('Error fetching store ID:', error);
    process.exit(1);
  }
}

getStoreId();
