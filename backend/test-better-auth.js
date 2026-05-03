const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '../.env' });
const { auth } = require('./src/modules/auth/better-auth');

async function testFetch() {
  console.log('Testing better-auth getSession on DB...');

  // mock what main.ts does
  BigInt.prototype.toJSON = function () {
    console.log("Called toJSON!");
    return Number(this);
  };

  try {
    const session = await auth.api.getSession({
      headers: {
        cookie: "better-auth.session_token=test",
      }
    });
    console.log("Session:", session);
  } catch (err) {
    console.log("Error inside getSession:", err);
  }
}
testFetch().then(() => process.exit(0));
