require("dotenv/config");

const { PrismaClient } = require("@prisma/client");

if (process.env.NODE_ENV === "production") {
  throw new Error("This development-only import cannot run with NODE_ENV=production.");
}

const prisma = new PrismaClient();

const catalogue = {
  title: "Amrah Mv Vis 53",
  slug: "amrah-mv-vis-53",
  sku: "AMRAH-MV-VIS-53-TEST",
  supplierName: "Amrah Wholesale",
  supplierCode: "AMRAH-WHOLESALE-TEST",
  sellingPrice: "999.00",
  supplierPrice: "755.00",
  description:
    "Catalogue Name: Amrah Mv Vis 53. Brand Name: Amrah Wholesale. Per Unit Supplier Price: ₹755. Full Catalogue Price: ₹3775 for 5 pieces. MOQ: 5 Pcs / 1 Set. Total Designs: 5. Product Type: Saree. Stitch Type: Unstitched Saree with Blouse Piece. Size: Standard 6.30 Meters (Includes Blouse). Saree Fabric: Dola Silk.",
  imageUrls: [
    ["/products/amrah-mv-vis-53/green.png", "Green/teal design"],
    ["/products/amrah-mv-vis-53/blue.png", "Blue design"],
    ["/products/amrah-mv-vis-53/red.png", "Red design"],
    ["/products/amrah-mv-vis-53/violet.png", "Purple design"],
    ["/products/amrah-mv-vis-53/lightpink.png", "Pink design"],
  ],
};

async function findOrCreateCategory() {
  const existing = await prisma.category.findFirst({
    where: { OR: [{ name: "Sarees" }, { slug: "sarees" }] },
    orderBy: { active: "desc" },
  });

  if (existing) {
    const category = existing.active
      ? existing
      : await prisma.category.update({ where: { id: existing.id }, data: { active: true } });
    return { category, action: existing.active ? "found" : "found and activated" };
  }

  const category = await prisma.category.create({
    data: { name: "Sarees", slug: "sarees", active: true },
  });
  return { category, action: "created" };
}

async function findOrCreateSupplier() {
  const existing = await prisma.supplier.findFirst({ where: { name: catalogue.supplierName } });

  if (existing) return { supplier: existing, action: "found" };

  const supplier = await prisma.supplier.create({
    data: { name: catalogue.supplierName, code: catalogue.supplierCode, active: true },
  });
  return { supplier, action: "created" };
}

async function importCatalogue() {
  const [{ category, action: categoryAction }, { supplier, action: supplierAction }] = await Promise.all([
    findOrCreateCategory(),
    findOrCreateSupplier(),
  ]);

  const existingProduct = await prisma.product.findUnique({ where: { slug: catalogue.slug } });
  const product = existingProduct
    ? await prisma.product.update({
        where: { id: existingProduct.id },
        data: {
          title: catalogue.title,
          description: catalogue.description,
          categoryId: category.id,
          sellingPrice: catalogue.sellingPrice,
          status: "PUBLISHED",
          publishedAt: existingProduct.publishedAt ?? new Date(),
        },
      })
    : await prisma.product.create({
        data: {
          title: catalogue.title,
          slug: catalogue.slug,
          description: catalogue.description,
          categoryId: category.id,
          sellingPrice: catalogue.sellingPrice,
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
      });

  const existingSupplierProduct = await prisma.supplierProduct.findUnique({
    where: { supplierId_supplierSku: { supplierId: supplier.id, supplierSku: catalogue.sku } },
  });
  const supplierProduct = existingSupplierProduct
    ? await prisma.supplierProduct.update({
        where: { id: existingSupplierProduct.id },
        data: {
          productId: product.id,
          supplierTitle: catalogue.title,
          supplierPrice: catalogue.supplierPrice,
        },
      })
    : await prisma.supplierProduct.create({
        data: {
          productId: product.id,
          supplierId: supplier.id,
          supplierSku: catalogue.sku,
          supplierTitle: catalogue.title,
          supplierPrice: catalogue.supplierPrice,
        },
      });

  let imagesCreated = 0;
  let imagesUpdated = 0;
  for (const [position, [imageUrl, altText]] of catalogue.imageUrls.entries()) {
    const existingImage = await prisma.productImage.findUnique({
      where: { productId_position: { productId: product.id, position } },
    });

    if (existingImage) {
      await prisma.productImage.update({
        where: { id: existingImage.id },
        data: { imageUrl, altText },
      });
      imagesUpdated += 1;
    } else {
      await prisma.productImage.create({ data: { productId: product.id, imageUrl, altText, position } });
      imagesCreated += 1;
    }
  }

  console.log(JSON.stringify({
    category: { action: categoryAction, id: category.id, name: category.name },
    supplier: { action: supplierAction, id: supplier.id, name: supplier.name },
    product: { action: existingProduct ? "updated" : "created", id: product.id, title: product.title },
    supplierProduct: { action: existingSupplierProduct ? "updated" : "created", id: supplierProduct.id, sku: supplierProduct.supplierSku },
    productImages: { created: imagesCreated, updated: imagesUpdated, total: catalogue.imageUrls.length },
    customerSellingPrice: catalogue.sellingPrice,
    supplierCost: catalogue.supplierPrice,
  }, null, 2));
}

importCatalogue()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });