const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function seed() {
  console.log('Starting database seeding...');
  
  try {
    // 1. Clean existing data
    await db.query('DELETE FROM ratings');
    await db.query('DELETE FROM users');
    
    // Reset auto-increment
    await db.query('ALTER TABLE users AUTO_INCREMENT = 1');
    await db.query('ALTER TABLE ratings AUTO_INCREMENT = 1');

    console.log('Database tables cleared and reset.');

    const salt = await bcrypt.genSalt(10);
    
    // Standard secure password for users
    const defaultPassword = 'UserPass123!';
    const defaultStorePassword = 'StorePass123!';
    const defaultAdminPassword = 'AdminPass123!';
    
    const hashedUserPass = await bcrypt.hash(defaultPassword, salt);
    const hashedStorePass = await bcrypt.hash(defaultStorePassword, salt);
    const hashedAdminPass = await bcrypt.hash(defaultAdminPassword, salt);

    // 2. Insert Admins, Users, and Stores
    // Note: Name must be between 20 and 60 characters long!
    const usersToInsert = [
      // Admins
      {
        name: 'System Administrator User', // 25 chars
        email: 'admin@platform.com',
        password: hashedAdminPass,
        address: 'Global Platform Control Center Head Office, NY 10001',
        role: 'Admin'
      },
      // Users
      {
        name: 'Johnathan Alexander Smith', // 25 chars
        email: 'john.smith@gmail.com',
        password: hashedUserPass,
        address: '123 Main Boulevard Road, Apt 4B, Los Angeles, CA 90012',
        role: 'User'
      },
      {
        name: 'Elizabeth Victoria Davis', // 24 chars
        email: 'elizabeth.d@gmail.com',
        password: hashedUserPass,
        address: '456 Pinecrest Heights Avenue, Suite 101, San Francisco, CA 94103',
        role: 'User'
      },
      // StoreOwners
      {
        name: 'The Gourmet Pizza Artisan Kitchen', // 33 chars
        email: 'gourmetpizza@store.com',
        password: hashedStorePass,
        address: '789 Culinary Boulevard, Floor 1, Seattle, WA 98101',
        role: 'StoreOwner'
      },
      {
        name: 'Elite Tech Devices Boutique', // 27 chars
        email: 'elitetech@store.com',
        password: hashedStorePass,
        address: '999 Innovation Parkway, Silicon Valley, CA 94025',
        role: 'StoreOwner'
      },
      {
        name: 'Organic Harvest Grocery Depot', // 29 chars
        email: 'organicgrocery@store.com',
        password: hashedStorePass,
        address: '444 Green Meadow Lane, Suite A, Austin, TX 78701',
        role: 'StoreOwner'
      }
    ];

    console.log('Inserting seed users/stores...');
    for (const u of usersToInsert) {
      await db.query(
        'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
        [u.name, u.email, u.password, u.address, u.role]
      );
    }
    
    // Get user IDs to create ratings
    const [rows] = await db.query('SELECT id, name, role FROM users');
    const john = rows.find(r => r.name === 'Johnathan Alexander Smith');
    const liz = rows.find(r => r.name === 'Elizabeth Victoria Davis');
    const pizzaStore = rows.find(r => r.name === 'The Gourmet Pizza Artisan Kitchen');
    const techStore = rows.find(r => r.name === 'Elite Tech Devices Boutique');
    const organicStore = rows.find(r => r.name === 'Organic Harvest Grocery Depot');

    console.log('Inserting seed ratings...');
    const ratingsToInsert = [
      { user_id: john.id, store_id: pizzaStore.id, rating: 5 },
      { user_id: john.id, store_id: techStore.id, rating: 4 },
      { user_id: liz.id, store_id: pizzaStore.id, rating: 4 },
      { user_id: liz.id, store_id: organicStore.id, rating: 3 }
    ];

    for (const r of ratingsToInsert) {
      await db.query(
        'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
        [r.user_id, r.store_id, r.rating]
      );
    }

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
