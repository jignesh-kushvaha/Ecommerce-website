import { Button, InputNumber, Card } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useCart } from "../../context/CartContext";
import { useMessage } from "../../context/MessageContext";
import API_ENDPOINTS from "../../config/apiConfig";

const CartItem = ({ item }) => {
  console.log("CartItem", item);

  const { updateQuantity, removeFromCart } = useCart();
  const message = useMessage();

  const handleQuantityChange = (value) => {
    updateQuantity(item.id, value);
  };

  const handleRemove = () => {
    removeFromCart(item.id);
    message.success(
      <div className="flex items-center">
        <DeleteOutlined className="mr-2 text-lg" />
        <span>Item removed from cart</span>
      </div>,
      2
    );
  };

  return (
    <Card className="mb-4 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex flex-col sm:flex-row">
        <div className="w-full sm:w-24 h-24 overflow-hidden bg-gray-100 mb-4 sm:mb-0 sm:mr-4">
          <img
            src={`${API_ENDPOINTS.base}/uploads/${item.image}`}
            alt={item.name}
            className="w-full h-full object-contain"
          />
        </div>

        <div className="flex-grow">
          <h3 className="text-lg font-semibold">{item.name}</h3>
          <p className="text-gray-500">₹{item.price.toFixed(2)}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center mt-4 sm:mt-0">
          <div className="flex flex-col items-end">
            <div className="flex items-center mb-2">
              <InputNumber
                min={1}
                max={10}
                value={item.quantity}
                onChange={handleQuantityChange}
                className="w-24 mr-0 sm:mr-4 mb-4 sm:mb-0"
              />

              <span className="text-lg font-semibold mb-2">
                ₹{(item.price * item.quantity).toFixed(2)}
              </span>
            </div>

            <Button
              type="default"
              danger
              icon={<DeleteOutlined />}
              onClick={handleRemove}
              className="border border-red-300 hover:bg-red-50 hover:border-red-500"
            >
              Remove
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CartItem;
