import mongoose from "mongoose";
import Product from "../Models/productModel.js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({
  path: join(__dirname, "../config.env"),
});

const products = [
  // Electronics Category
  {
    name: "Smart LED TV 55-inch",
    description:
      "4K Ultra HD Smart LED TV with HDR and built-in streaming apps",
    price: 699.99,
    category: "Electronics",
    images: ["https://via.placeholder.com/500x500?text=Smart+TV"],
    stock: 15,
  },
  {
    name: "Wireless Noise-Cancelling Headphones",
    description: "Premium wireless headphones with active noise cancellation",
    price: 249.99,
    category: "Electronics",
    images: ["https://via.placeholder.com/500x500?text=Headphones"],
    stock: 25,
  },
  {
    name: "Gaming Laptop",
    description: "15.6-inch gaming laptop with RTX 3060, 16GB RAM, 512GB SSD",
    price: 1299.99,
    category: "Electronics",
    images: ["https://via.placeholder.com/500x500?text=Gaming+Laptop"],
    stock: 10,
  },
  {
    name: "Smartphone Pro Max",
    description:
      "Latest smartphone with 6.7-inch OLED display and triple camera",
    price: 999.99,
    category: "Electronics",
    images: ["https://via.placeholder.com/500x500?text=Smartphone"],
    stock: 20,
  },
  {
    name: "Wireless Earbuds",
    description: "True wireless earbuds with active noise cancellation",
    price: 159.99,
    category: "Electronics",
    images: ["https://via.placeholder.com/500x500?text=Earbuds"],
    stock: 30,
  },
  {
    name: "Smart Watch Series 5",
    description: "Advanced smartwatch with health monitoring features",
    price: 299.99,
    category: "Electronics",
    images: ["https://via.placeholder.com/500x500?text=Smart+Watch"],
    stock: 18,
  },

  // Books Category
  {
    name: "The Art of Programming",
    description: "Comprehensive guide to modern programming practices",
    price: 49.99,
    category: "Books",
    images: ["https://via.placeholder.com/500x500?text=Programming+Book"],
    stock: 50,
  },
  {
    name: "Digital Marketing Essentials",
    description: "Latest strategies in digital marketing and social media",
    price: 34.99,
    category: "Books",
    images: ["https://via.placeholder.com/500x500?text=Marketing+Book"],
    stock: 40,
  },
  {
    name: "Science Fiction Anthology",
    description: "Collection of award-winning science fiction stories",
    price: 24.99,
    category: "Books",
    images: ["https://via.placeholder.com/500x500?text=SciFi+Book"],
    stock: 35,
  },
  {
    name: "Cooking Masterclass",
    description: "Professional cooking techniques and recipes",
    price: 39.99,
    category: "Books",
    images: ["https://via.placeholder.com/500x500?text=Cooking+Book"],
    stock: 25,
  },
  {
    name: "Financial Freedom Guide",
    description: "Personal finance and investment strategies",
    price: 29.99,
    category: "Books",
    images: ["https://via.placeholder.com/500x500?text=Finance+Book"],
    stock: 45,
  },
  {
    name: "History of Art",
    description: "Comprehensive guide to art history and movements",
    price: 59.99,
    category: "Books",
    images: ["https://via.placeholder.com/500x500?text=Art+Book"],
    stock: 20,
  },

  // Fashion Category
  {
    name: "Premium Denim Jeans",
    description: "High-quality slim-fit denim jeans",
    price: 79.99,
    category: "Fashion",
    images: ["https://via.placeholder.com/500x500?text=Jeans"],
    stock: 50,
  },
  {
    name: "Classic White Sneakers",
    description: "Versatile white leather sneakers",
    price: 89.99,
    category: "Fashion",
    images: ["https://via.placeholder.com/500x500?text=Sneakers"],
    stock: 30,
  },
  {
    name: "Cotton Casual Shirt",
    description: "Comfortable cotton shirt for casual wear",
    price: 45.99,
    category: "Fashion",
    images: ["https://via.placeholder.com/500x500?text=Shirt"],
    stock: 40,
  },
  {
    name: "Leather Crossbody Bag",
    description: "Stylish leather crossbody bag with multiple compartments",
    price: 129.99,
    category: "Fashion",
    images: ["https://via.placeholder.com/500x500?text=Bag"],
    stock: 25,
  },
  {
    name: "Winter Parka Jacket",
    description: "Warm and waterproof winter parka with fur hood",
    price: 199.99,
    category: "Fashion",
    images: ["https://via.placeholder.com/500x500?text=Jacket"],
    stock: 20,
  },
  {
    name: "Sports Running Shoes",
    description: "Lightweight running shoes with cushioned sole",
    price: 119.99,
    category: "Fashion",
    images: ["https://via.placeholder.com/500x500?text=Running+Shoes"],
    stock: 35,
  },
  {
    name: "Summer Dress Collection",
    description: "Floral print summer dresses in various styles",
    price: 69.99,
    category: "Fashion",
    images: ["https://via.placeholder.com/500x500?text=Summer+Dress"],
    stock: 30,
  },
  {
    name: "Designer Sunglasses",
    description: "UV protection designer sunglasses",
    price: 159.99,
    category: "Fashion",
    images: ["https://via.placeholder.com/500x500?text=Sunglasses"],
    stock: 15,
  },
];

const seedProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Delete existing products
    await Product.deleteMany({});
    console.log("Deleted existing products");

    // Insert new products
    await Product.insertMany(products);
    console.log("Successfully seeded products");

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error seeding products:", error);
    process.exit(1);
  }
};

// Run the seeder
seedProducts();
