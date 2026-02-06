import sequelize from "../config/database.js";
import Category from "../Models/Category.js";
import Product from "../Models/Product.js";
import ProductVariant from "../Models/ProductVariant.js";
import Inventory from "../Models/Inventory.js";
import User from "../Models/User.js";

async function seedDatabase() {
  try {
    console.log("Starting database seeding...");

    // Create categories
    console.log("Creating categories...");
    const categoryCount = await Category.count();
    if (categoryCount > 0) {
      console.log("⚠ Categories already exist. Skipping seeding.");
      process.exit(0);
    }

    const electronics = await Category.create({
      name: "Electronics",
      slug: "electronics",
      description: "Electronic devices and gadgets",
    });
    console.log("✓ Electronics category created");
    // Create products with variants
    console.log("Creating products and variants...");

    // Product 1: iPhone 15 Pro
    const iphone15 = await Product.create({
      categoryId: electronics.id,
      name: "Apple iPhone 15 Pro",
      slug: "apple-iphone-15-pro",
      description: "Premium smartphone with advanced camera and A17 Pro chip",
      brand: "Apple",
      basePrice: 999.99,
      isActive: true,
    });

    // iPhone 15 variants
    const iphoneVariants = [
      {
        color: "Black",
        hexColor: "#000000",
        storage: 128,
        ram: 8,
        price: 999.99,
      },
      {
        color: "Black",
        hexColor: "#000000",
        storage: 256,
        ram: 8,
        price: 1099.99,
      },
      {
        color: "Black",
        hexColor: "#000000",
        storage: 512,
        ram: 8,
        price: 1299.99,
      },
      {
        color: "Gold",
        hexColor: "#FFD700",
        storage: 128,
        ram: 8,
        price: 999.99,
      },
      {
        color: "Gold",
        hexColor: "#FFD700",
        storage: 256,
        ram: 8,
        price: 1099.99,
      },
      {
        color: "Titanium",
        hexColor: "#A8A9AD",
        storage: 256,
        ram: 8,
        price: 1099.99,
      },
    ];

    for (const variant of iphoneVariants) {
      const productVariant = await ProductVariant.create({
        productId: iphone15.id,
        sku: `SKU-IP15-${variant.color.substring(0, 3).toUpperCase()}-${variant.storage}GB`,
        color: variant.color,
        hexColor: variant.hexColor,
        storageGb: variant.storage,
        ramGb: variant.ram,
        price: variant.price,
      });

      await Inventory.create({
        variantId: productVariant.id,
        quantityAvailable: 20,
        quantityReserved: 0,
      });
    }
    console.log("✓ iPhone 15 Pro and 6 variants created");

    // Product 2: Samsung Galaxy S24
    const galaxyS24 = await Product.create({
      categoryId: electronics.id,
      name: "Samsung Galaxy S24 Ultra",
      slug: "samsung-galaxy-s24-ultra",
      description: "Flagship Android phone with Snapdragon 8 Gen 3",
      brand: "Samsung",
      basePrice: 1299.99,
      isActive: true,
    });

    const galaxyVariants = [
      {
        color: "Black",
        hexColor: "#000000",
        storage: 256,
        ram: 12,
        price: 1299.99,
      },
      {
        color: "Black",
        hexColor: "#000000",
        storage: 512,
        ram: 12,
        price: 1399.99,
      },
      {
        color: "Gray",
        hexColor: "#808080",
        storage: 256,
        ram: 12,
        price: 1299.99,
      },
      {
        color: "Purple",
        hexColor: "#800080",
        storage: 256,
        ram: 12,
        price: 1299.99,
      },
      {
        color: "Purple",
        hexColor: "#800080",
        storage: 512,
        ram: 12,
        price: 1399.99,
      },
    ];

    for (const variant of galaxyVariants) {
      const productVariant = await ProductVariant.create({
        productId: galaxyS24.id,
        sku: `SKU-GS24-${variant.color.substring(0, 3).toUpperCase()}-${variant.storage}GB`,
        color: variant.color,
        hexColor: variant.hexColor,
        storageGb: variant.storage,
        ramGb: variant.ram,
        price: variant.price,
      });

      await Inventory.create({
        variantId: productVariant.id,
        quantityAvailable: 15,
        quantityReserved: 0,
      });
    }
    console.log("✓ Samsung Galaxy S24 Ultra and 5 variants created");

    // Product 3: Google Pixel 8 Pro
    const pixel8 = await Product.create({
      categoryId: electronics.id,
      name: "Google Pixel 8 Pro",
      slug: "google-pixel-8-pro",
      description: "Google's flagship with advanced AI features",
      brand: "Google",
      basePrice: 899.99,
      isActive: true,
    });

    const pixelVariants = [
      {
        color: "Obsidian",
        hexColor: "#1A1A1A",
        storage: 128,
        ram: 12,
        price: 899.99,
      },
      {
        color: "Obsidian",
        hexColor: "#1A1A1A",
        storage: 256,
        ram: 12,
        price: 999.99,
      },
      {
        color: "Bay",
        hexColor: "#4B9BBD",
        storage: 128,
        ram: 12,
        price: 899.99,
      },
      {
        color: "Bay",
        hexColor: "#4B9BBD",
        storage: 256,
        ram: 12,
        price: 999.99,
      },
      {
        color: "Porcelain",
        hexColor: "#EBE4D9",
        storage: 256,
        ram: 12,
        price: 999.99,
      },
    ];

    for (const variant of pixelVariants) {
      const productVariant = await ProductVariant.create({
        productId: pixel8.id,
        sku: `SKU-PX8-${variant.color.substring(0, 3).toUpperCase()}-${variant.storage}GB`,
        color: variant.color,
        hexColor: variant.hexColor,
        storageGb: variant.storage,
        ramGb: variant.ram,
        price: variant.price,
      });

      await Inventory.create({
        variantId: productVariant.id,
        quantityAvailable: 25,
        quantityReserved: 0,
      });
    }
    console.log("✓ Google Pixel 8 Pro and 5 variants created");

    // Product 4: OnePlus 12
    const oneplus12 = await Product.create({
      categoryId: electronics.id,
      name: "OnePlus 12",
      slug: "oneplus-12",
      description: "Fast charging flagship killer with 120Hz display",
      brand: "OnePlus",
      basePrice: 799.99,
      isActive: true,
    });

    const oneplusVariants = [
      {
        color: "Black",
        hexColor: "#000000",
        storage: 256,
        ram: 12,
        price: 799.99,
      },
      {
        color: "Black",
        hexColor: "#000000",
        storage: 512,
        ram: 12,
        price: 899.99,
      },
      {
        color: "Silky Black",
        hexColor: "#1F2937",
        storage: 256,
        ram: 12,
        price: 799.99,
      },
      {
        color: "Silky White",
        hexColor: "#F8F8F8",
        storage: 512,
        ram: 12,
        price: 899.99,
      },
    ];

    for (const variant of oneplusVariants) {
      const productVariant = await ProductVariant.create({
        productId: oneplus12.id,
        sku: `SKU-OP12-${variant.color.substring(0, 3).toUpperCase()}-${variant.storage}GB`,
        color: variant.color,
        hexColor: variant.hexColor,
        storageGb: variant.storage,
        ramGb: variant.ram,
        price: variant.price,
      });

      await Inventory.create({
        variantId: productVariant.id,
        quantityAvailable: 18,
        quantityReserved: 0,
      });
    }
    console.log("✓ OnePlus 12 and 4 variants created");

    console.log("\n✅ Database seeding completed successfully!");
    console.log("\nSeeded data:");
    console.log(
      "- 4 products (iPhone 15 Pro, Galaxy S24 Ultra, Pixel 8 Pro, OnePlus 12)",
    );
    console.log(
      "- 20 product variants with different colors and storage options",
    );
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
}

seedDatabase();
