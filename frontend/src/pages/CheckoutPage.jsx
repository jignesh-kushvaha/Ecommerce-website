import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Select,
  Divider,
  Typography,
  Steps,
  Result,
  Card,
  List,
  Row,
  Col,
  Alert,
} from "antd";
import {
  ShoppingOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
  LeftOutlined,
} from "@ant-design/icons";
import { useCart } from "../context/CartContext";
import * as orderService from "../services/orderService";

const { Title, Text } = Typography;
const { Option } = Select;
const { Step } = Steps;

const CheckoutPage = () => {
  const [current, setCurrent] = useState(0);
  const [shippingAddress, setShippingAddress] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("creditCard");
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [error, setError] = useState("");

  const { cart, total, clearCart } = useCart();
  const navigate = useNavigate();

  const steps = [
    {
      title: "Shipping",
      icon: <ShoppingOutlined />,
    },
    {
      title: "Payment",
      icon: <CreditCardOutlined />,
    },
    {
      title: "Confirmation",
      icon: <CheckCircleOutlined />,
    },
  ];

  const handleShippingSubmit = (values) => {
    setShippingAddress(values);
    setCurrent(1);
  };

  const handlePaymentSubmit = (values) => {
    setPaymentMethod(values.paymentMethod);
    setCurrent(2);
  };

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      setError("");

      // Format the products for the order
      const products = cart.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      }));

      // Create the order data
      const orderData = {
        products,
        shippingAddress,
        paymentMethod,
      };

      // Place the order
      const response = await orderService.placeOrder(orderData);

      // Set order ID for confirmation
      setOrderId(response.data._id);
      setOrderPlaced(true);

      // Clear the cart after successful order
      clearCart();
    } catch (err) {
      setError(err.message || "Failed to place order. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderShippingForm = () => (
    <Card className="max-w-lg mx-auto">
      <Form
        layout="vertical"
        onFinish={handleShippingSubmit}
        initialValues={shippingAddress}
      >
        <Title level={4} className="mb-4">
          Shipping Information
        </Title>

        <Form.Item
          name="name"
          label="Full Name"
          rules={[{ required: true, message: "Please enter your full name" }]}
        >
          <Input placeholder="John Doe" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email Address"
          rules={[
            { required: true, message: "Please enter your email" },
            { type: "email", message: "Please enter a valid email" },
          ]}
        >
          <Input placeholder="john.doe@example.com" />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Phone Number"
          rules={[
            { required: true, message: "Please enter your phone number" },
            {
              pattern: /^[6-9]\d{9}$/,
              message: "Please enter a valid Indian phone number",
            },
          ]}
        >
          <Input placeholder="9876543210" />
        </Form.Item>

        <Form.Item
          name="address"
          label="Street Address"
          rules={[{ required: true, message: "Please enter your address" }]}
        >
          <Input placeholder="123 Main St" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="city"
              label="City"
              rules={[{ required: true, message: "Please enter your city" }]}
            >
              <Input placeholder="New York" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="postalCode"
              label="Postal Code"
              rules={[
                { required: true, message: "Please enter your postal code" },
              ]}
            >
              <Input placeholder="10001" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="country"
          label="Country"
          rules={[{ required: true, message: "Please select your country" }]}
        >
          <Select placeholder="Select your country">
            <Option value="USA">United States</Option>
            <Option value="Canada">Canada</Option>
            <Option value="UK">United Kingdom</Option>
            <Option value="Australia">Australia</Option>
            <Option value="India">India</Option>
          </Select>
        </Form.Item>

        <Row gutter={16} className="mt-6">
          <Col span={12}>
            <Button onClick={() => navigate("/cart")}>
              <LeftOutlined /> Back to Cart
            </Button>
          </Col>
          <Col span={12} className="text-right">
            <Button type="primary" htmlType="submit">
              Continue to Payment
            </Button>
          </Col>
        </Row>
      </Form>
    </Card>
  );

  const renderPaymentForm = () => (
    <Card className="max-w-lg mx-auto">
      <Form
        layout="vertical"
        onFinish={handlePaymentSubmit}
        initialValues={{ paymentMethod }}
      >
        <Title level={4} className="mb-4">
          Payment Method
        </Title>

        <Form.Item
          name="paymentMethod"
          rules={[
            { required: true, message: "Please select a payment method" },
          ]}
        >
          <Select placeholder="Select payment method">
            <Option value="creditCard">Credit Card</Option>
            <Option value="paypal">PayPal</Option>
            <Option value="bankTransfer">Bank Transfer</Option>
          </Select>
        </Form.Item>

        {paymentMethod === "creditCard" && (
          <>
            <Form.Item
              name="cardNumber"
              label="Card Number"
              rules={[
                { required: true, message: "Please enter your card number" },
              ]}
            >
              <Input placeholder="1234 5678 9012 3456" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="expiryDate"
                  label="Expiry Date"
                  rules={[{ required: true, message: "Required" }]}
                >
                  <Input placeholder="MM/YY" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="cvv"
                  label="CVV"
                  rules={[{ required: true, message: "Required" }]}
                >
                  <Input placeholder="123" />
                </Form.Item>
              </Col>
            </Row>
          </>
        )}

        <Row gutter={16} className="mt-6">
          <Col span={12}>
            <Button onClick={() => setCurrent(0)}>
              <LeftOutlined /> Back to Shipping
            </Button>
          </Col>
          <Col span={12} className="text-right">
            <Button type="primary" htmlType="submit">
              Review Order
            </Button>
          </Col>
        </Row>
      </Form>
    </Card>
  );

  const renderOrderReview = () => (
    <Card className="max-w-2xl mx-auto">
      <Title level={4} className="mb-4">
        Review Your Order
      </Title>

      <div className="mb-6">
        <Title level={5}>Shipping Address</Title>
        <Text>{shippingAddress.name}</Text>
        <br />
        <Text>{shippingAddress.address}</Text>
        <br />
        <Text>
          {shippingAddress.city}, {shippingAddress.postalCode}
        </Text>
        <br />
        <Text>{shippingAddress.country}</Text>
        <br />
        <Text>{shippingAddress.phone}</Text>
      </div>

      <div className="mb-6">
        <Title level={5}>Payment Method</Title>
        <Text>
          {paymentMethod === "creditCard" && "Credit Card"}
          {paymentMethod === "paypal" && "PayPal"}
          {paymentMethod === "bankTransfer" && "Bank Transfer"}
        </Text>
      </div>

      <Divider />

      <div className="mb-6">
        <Title level={5}>Order Items</Title>
        <List
          itemLayout="horizontal"
          dataSource={cart}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                }
                title={item.name}
                description={`Quantity: ${item.quantity}`}
              />
              <div className="text-right">
                <Text>₹{(item.price * item.quantity).toFixed(2)}</Text>
              </div>
            </List.Item>
          )}
        />
      </div>

      <Divider />

      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <Text>
            Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)}{" "}
            items)
          </Text>
          <Text>₹{total.toFixed(2)}</Text>
        </div>
        <div className="flex justify-between mb-2">
          <Text>Shipping</Text>
          <Text>Free</Text>
        </div>
        <Divider />
        <div className="flex justify-between">
          <Text strong className="text-lg">
            Order Total
          </Text>
          <Text strong className="text-lg">
            ₹{total.toFixed(2)}
          </Text>
        </div>
      </div>

      {error && (
        <Alert
          type="error"
          message="Error"
          description={error}
          className="mb-4"
          showIcon
        />
      )}

      <Row gutter={16} className="mt-6">
        <Col span={12}>
          <Button onClick={() => setCurrent(1)}>
            <LeftOutlined /> Back to Payment
          </Button>
        </Col>
        <Col span={12} className="text-right">
          <Button
            type="primary"
            onClick={handlePlaceOrder}
            loading={loading}
            className="bg-green-600 hover:bg-green-700 border-green-600"
          >
            Place Order
          </Button>
        </Col>
      </Row>
    </Card>
  );

  const renderOrderConfirmation = () => (
    <Result
      status="success"
      title="Order Successfully Placed!"
      subTitle={`Order number: ${orderId ? orderId.slice(-8) : "N/A"}`}
      extra={[
        <Button
          type="primary"
          key="orders"
          onClick={() => navigate(`/orders/${orderId}`)}
        >
          View Order Details
        </Button>,
        <Button key="buy" onClick={() => navigate("/products")}>
          Continue Shopping
        </Button>,
      ]}
    />
  );

  return (
    <div>
      <Title level={2} className="mb-6 text-center">
        Checkout
      </Title>

      <Steps
        current={orderPlaced ? 3 : current}
        className="max-w-3xl mx-auto mb-8"
        items={steps}
      />

      {orderPlaced ? (
        renderOrderConfirmation()
      ) : (
        <>
          {current === 0 && renderShippingForm()}
          {current === 1 && renderPaymentForm()}
          {current === 2 && renderOrderReview()}
        </>
      )}
    </div>
  );
};

export default CheckoutPage;
