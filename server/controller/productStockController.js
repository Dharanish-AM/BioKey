const { ProductStock } = require("../models/Productstock.js");

async function addStock() {
  try {
    const newProductStock = new ProductStock({
      status: "active",
    });

    await newProductStock.save();

    return {
      success: true,
      message: "Product stock added successfully",
      productStock: newProductStock,
    };
  } catch (error) {
    console.error("Error adding product stock:", error);
    return {
      success: false,
      message: error.message || "An error occurred while adding product stock.",
    };
  }
}

async function removeStock(device_id) {
  try {
    const productDetails = await ProductStock.findOne({ device_id });

    if (!productDetails) {
      throw new Error("Product not found");
    }

    productDetails.sold_status = "sold";
    await productDetails.save();

    console.log(`Product with device_id ${device_id} marked as sold.`);
  } catch (error) {
    console.error("Error updating product:", error.message);
  }
}

module.exports = {
  addStock,
  removeStock,
};
