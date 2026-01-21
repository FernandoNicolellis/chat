// Command-line script to create a user (no API registration)
const readline = require('readline');
const bcrypt = require('bcryptjs');
const { createUser } = require('./user');

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  function ask(q) {
    return new Promise(resolve => rl.question(q, resolve));
  }

  const name = await ask('Name: ');
  const email = await ask('Email: ');
  const password = await ask('Password: ');
  rl.close();

  const hash = await bcrypt.hash(password, 10);
  try {
    await createUser({ name, email, password: hash });
    console.log('User created successfully!');
  } catch (e) {
    console.error('Error creating user:', e.message);
  }
}

if (require.main === module) {
  main();
}
