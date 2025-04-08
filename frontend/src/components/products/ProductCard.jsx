import { Card, Button, Rate, message } from "antd";
import { ShoppingCartOutlined, EyeOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

const { Meta } = Card;

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      message.info("Please login to add items to cart");
      navigate("/login");
      return;
    }
    addToCart(product);
    message.success({
      content: `${product.name} added to cart successfully!`,
      duration: 2,
    });
  };

  // Fallback image in case product images are missing
  const imageUrl =
    product.images && product.images.length
      ? product.images[0]
      : "https://via.placeholder.com/300x300?text=No+Image";

  return (
    <Card
      hoverable
      className="h-full flex flex-col"
      cover={
        <div className="h-48 overflow-hidden bg-gray-100">
          <img
            alt={product.name}
            src={imageUrl}
            className="object-cover w-full h-full"
          />
        </div>
      }
      actions={[
        <Link to={`/products/${product._id}`} key="view">
          <EyeOutlined /> View
        </Link>,
        <Button
          type="link"
          onClick={handleAddToCart}
          key="addToCart"
          icon={<ShoppingCartOutlined />}
        >
          Add to Cart
        </Button>,
      ]}
    >
      <Meta
        title={<Link to={`/products/${product._id}`}>{product.name}</Link>}
        description={
          <div>
            <p className="text-gray-500 truncate">{product.description}</p>
            <div className="flex justify-between items-center mt-2">
              <span className="font-bold text-lg">₹{product.price}</span>
              <span className="text-xs text-gray-500">
                Stock: {product.stock}
              </span>
            </div>
            {product.averageRating && (
              <Rate
                disabled
                defaultValue={product.averageRating}
                allowHalf
                className="mt-2 text-sm"
              />
            )}
          </div>
        }
      />
    </Card>
  );
};

export default ProductCard;
