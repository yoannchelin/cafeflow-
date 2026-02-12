require("dotenv").config();
const bcrypt = require("bcryptjs");
const { connectDb } = require("./db");
const User = require("./models/User");
const MenuItem = require("./models/MenuItem");

async function seed() {
  await connectDb(process.env.MONGODB_URI);

  await User.deleteMany({});
  await MenuItem.deleteMany({});

  const admin = await User.create({
    email: "admin@cafeflow.dev",
    passwordHash: await bcrypt.hash("Admin123!", 10),
    role: "admin"
  });

  const staff = await User.create({
    email: "staff@cafeflow.dev",
    passwordHash: await bcrypt.hash("Staff123!", 10),
    role: "staff"
  });

  await MenuItem.insertMany([
    {
      name: "Flat White",
      description: "Double ristretto style, silky microfoam.",
      category: "Coffee",
      priceCents: 520
    },
    {
      name: "Long Black",
      description: "Espresso over hot water.",
      category: "Coffee",
      priceCents: 480
    },
    {
      name: "Iced Latte",
      description: "Cold milk + espresso over ice.",
      category: "Cold",
      priceCents: 650
    },
    {
      name: "Banana Smoothie",
      description: "Banana, milk, honey.",
      category: "Cold",
      priceCents: 700
    },
    {
      name: "Ham & Cheese Toastie",
      description: "Classic toasted sandwich.",
      category: "Food",
      priceCents: 990
    }
  ]);

  console.log("Seed complete ✅");
  console.log("Admin:", admin.email, "Admin123!");
  console.log("Staff:", staff.email, "Staff123!");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
