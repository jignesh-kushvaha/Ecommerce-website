import { Button, Rate, Badge, Space, Tooltip } from "antd";
import {
  ShoppingCartOutlined,
  EyeOutlined,
  HeartOutlined,
  HeartFilled,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useMessage } from "../../context/MessageContext";

import API_ENDPOINTS from "../../config/apiConfig";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const message = useMessage();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleAddToCart = () => {
    /*     if (!isAuthenticated) {
      message.warning("Please login to add items to your cart", 2);
      navigate("/login");
      return;
    } */
    addToCart(product);
    message.success(
      <div className="flex items-center">
        <ShoppingCartOutlined className="mr-2 text-lg" />
        <span>
          <strong>{product.name}</strong> added to cart!
        </span>
      </div>,
      3,
    );
  };

  const handleWishlist = () => {
    if (!isAuthenticated) {
      message.warning("Please login to use wishlist", 2);
      navigate("/login");
      return;
    }
    setLiked(!liked);
    message.success(!liked ? "Added to wishlist" : "Removed from wishlist", 2);
  };

  // Get the first variant's minimum and maximum price
  const variantPrices =
    product.ProductVariants && product.ProductVariants.length > 0
      ? product.ProductVariants.map((v) => parseFloat(v.price))
      : [parseFloat(product.basePrice)];

  const minPrice = Math.min(...variantPrices);
  const maxPrice = Math.max(...variantPrices);
  const priceRange =
    minPrice !== maxPrice ? `₹${minPrice} - ₹${maxPrice}` : `₹${minPrice}`;

  // Calculate stock availability
  const totalStock =
    product.ProductVariants && product.ProductVariants.length > 0
      ? product.ProductVariants.reduce(
          (sum, v) => sum + (v.Inventory?.quantityAvailable || 0),
          0,
        )
      : 0;

  const inStock = totalStock > 0;

  // Get variant color options for display
  const colorVariants =
    product.ProductVariants && product.ProductVariants.length > 0
      ? [...new Set(product.ProductVariants.map((v) => v.color))]
      : [];

  // Fallback image
  const imageUrl =
    product.images && product.images.length
      ? `${API_ENDPOINTS.base}/uploads/${product.images[0]}`
      : "https://placehold.net/default.png";

  return (
    <div className="group">
      <div
        className="relative bg-white rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Badge */}
        <div className="absolute top-3 left-3 z-10">
          {inStock ? (
            <Badge
              count="IN STOCK"
              style={{
                backgroundColor: "#22c55e",
                fontSize: "10px",
                fontWeight: "bold",
                padding: "2px 6px",
              }}
            />
          ) : (
            <Badge
              count="OUT OF STOCK"
              style={{
                backgroundColor: "#ef4444",
                fontSize: "10px",
                fontWeight: "bold",
                padding: "2px 6px",
              }}
            />
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-colors"
        >
          {liked ? (
            <HeartFilled className="text-red-500 text-lg" />
          ) : (
            <HeartOutlined className="text-gray-400 text-lg hover:text-red-500" />
          )}
        </button>

        {/* Image Container */}
        <Link to={`/products/${product.id}`} className="block">
          <div className="relative h-56 bg-gray-100 overflow-hidden">
            <img
              alt={product.name}
              src={imageUrl}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {/* Overlay Actions - visible on hover */}
            {hovered && (
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center gap-3">
                <Tooltip title="View Details">
                  <Button
                    type="primary"
                    shape="circle"
                    size="large"
                    icon={<EyeOutlined className="text-xl" />}
                    className="bg-white text-gray-800 border-0 hover:bg-gray-100"
                  />
                </Tooltip>
                <Tooltip title="Quick View">
                  <Button
                    type="primary"
                    shape="circle"
                    size="large"
                    icon={<ShoppingCartOutlined className="text-xl" />}
                    onClick={(e) => {
                      e.preventDefault();
                      handleAddToCart();
                    }}
                    disabled={!inStock}
                  />
                </Tooltip>
              </div>
            )}
          </div>
        </Link>

        {/* Product Info */}
        <div className="p-4">
          {/* Category */}
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            {product.Category?.name || "Electronics"}
          </p>

          {/* Product Name */}
          <Link to={`/products/${product.id}`}>
            <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2 hover:text-blue-600 transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Brand */}
          {product.brand && (
            <p className="text-xs text-gray-600 mb-2 font-medium">
              {product.brand}
            </p>
          )}

          {/* Description */}
          <p className="text-xs text-gray-600 line-clamp-1 mb-3">
            {product.description}
          </p>

          {/* Color Variants */}
          {colorVariants.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-600 mb-1">
                {colorVariants.length} color
                {colorVariants.length !== 1 ? "s" : ""}
              </p>
              <div className="flex gap-2">
                {colorVariants.slice(0, 3).map((colorName) => {
                  const colorVariant = product.ProductVariants?.find(
                    (v) => v.color === colorName,
                  );
                  return (
                    <Tooltip key={colorName} title={colorName}>
                      <div
                        className="w-5 h-5 rounded-full border-2 border-gray-200"
                        style={{
                          backgroundColor:
                            colorVariant?.hexColor || getColorCode(colorName),
                        }}
                      />
                    </Tooltip>
                  );
                })}
                {colorVariants.length > 3 && (
                  <span className="text-xs text-gray-500 ml-1">
                    +{colorVariants.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-200 my-3"></div>

          {/* Rating */}
          <div className="flex items-center justify-between mb-3">
            <Rate
              disabled
              defaultValue={product.averageRating || 4}
              allowHalf
              className="text-sm"
            />
            <span className="text-xs text-gray-500">({totalStock})</span>
          </div>

          {/* Price */}
          <div className="mb-4">
            <p className="text-lg font-bold text-gray-900">{priceRange}</p>
            {minPrice !== maxPrice && (
              <p className="text-xs text-gray-500">
                {product.ProductVariants?.length || 0} variants available
              </p>
            )}
          </div>

          {/* Action Button */}
          <Button
            type="primary"
            block
            size="large"
            icon={<ShoppingCartOutlined />}
            onClick={handleAddToCart}
            disabled={!inStock}
            className="rounded-lg font-semibold"
          >
            {inStock ? "Add to Cart" : "Out of Stock"}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Helper function to get color code from color name
function getColorCode(colorName) {
  const colorMap = {
    black: "#000000",
    white: "#FFFFFF",
    red: "#EF4444",
    blue: "#3B82F6",
    green: "#22C55E",
    yellow: "#EAB308",
    gray: "#9CA3AF",
    purple: "#A855F7",
    pink: "#EC4899",
    silver: "#E5E7EB",
    "silky white": "#F8F8F8",
    "silky black": "#1F2937",
    porcelain: "#EBE4D9",
    bay: "#4B9BBD",
    obsidian: "#1A1A1A",
    gold: "#FFD700",
    titanium: "#A8A9AD",
  };

  return colorMap[colorName?.toLowerCase()] || "#CCCCCC";
}
export default ProductCard;
