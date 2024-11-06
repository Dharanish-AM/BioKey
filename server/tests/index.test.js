const { ProductStock } = require("../models/Productstock"); // Adjust the path
const { removeStock } = require("../controller/productStockController"); // Adjust the path

jest.mock("../models/Productstock"); // Mock the model

describe("removeStock", () => {
  it("should mark the product as sold", async () => {
    const mockProduct = {
      device_id: 1,
      sold_status: "not sold",
      save: jest.fn(),
    };

    ProductStock.findOne.mockResolvedValue(mockProduct);

    await removeStock(1);

    expect(ProductStock.findOne).toHaveBeenCalledWith({ device_id: 1 });
    expect(mockProduct.sold_status).toBe("sold");
    expect(mockProduct.save).toHaveBeenCalled();
  });

  it("should throw an error if the product is not found", async () => {
    ProductStock.findOne.mockResolvedValue(null);

    await expect(removeStock(2)).rejects.toThrow("Product not found");
  });
});
