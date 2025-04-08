import { Button, InputNumber, Card } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useCart } from "../../context/CartContext";

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  const handleQuantityChange = (value) => {
    updateQuantity(item.id, value);
  };

  const handleRemove = () => {
    removeFromCart(item.id);
  };

  return (
    <Card className="mb-4 shadow-sm">
      <div className="flex flex-col sm:flex-row">
        <div className="w-full sm:w-24 h-24 overflow-hidden bg-gray-100 mb-4 sm:mb-0 sm:mr-4">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-grow">
          <h3 className="text-lg font-semibold">{item.name}</h3>
          <p className="text-gray-500">₹{item.price.toFixed(2)}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center mt-4 sm:mt-0">
          <InputNumber
            min={1}
            max={99}
            value={item.quantity}
            onChange={handleQuantityChange}
            className="w-24 mr-0 sm:mr-4 mb-4 sm:mb-0"
          />

          <div className="flex flex-col items-end">
            <span className="text-lg font-semibold mb-2">
              ₹{(item.price * item.quantity).toFixed(2)}
            </span>

            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={handleRemove}
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
