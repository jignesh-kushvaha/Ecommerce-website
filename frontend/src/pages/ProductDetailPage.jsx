import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Typography,
  Row,
  Col,
  Button,
  InputNumber,
  Carousel,
  Tabs,
  Rate,
  Form,
  Input,
  Spin,
  Alert,
  Breadcrumb,
  message,
} from "antd";
import {
  ShoppingCartOutlined,
  ArrowLeftOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import * as productService from "../services/productService";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import API_ENDPOINTS from "../config/apiConfig";

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

const ProductDetailPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await productService.getProduct(id);
        setProduct(response.data);
      } catch (err) {
        setError("Failed to load product details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleQuantityChange = (value) => {
    setQuantity(value);
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      message.warning({
        content: "Please login to add items to your cart",
        duration: 2,
        className: "custom-message",
      });
      navigate("/login");
      return;
    }

    if (product && quantity > 0) {
      addToCart(product, quantity);
      message.success({
        content: (
          <div className="flex items-center">
            <ShoppingCartOutlined className="mr-2 text-lg" />
            <span>
              <strong>
                {quantity} x {product.name}
              </strong>{" "}
              added to cart successfully!
            </span>
          </div>
        ),
        duration: 3,
        className: "custom-message",
      });
    }
  };

  const handleReviewSubmit = async (values) => {
    try {
      setReviewSubmitting(true);
      setReviewError("");
      setReviewSuccess(false);

      await productService.addReview(id, values);

      setReviewSuccess(true);
      // Reload product to show the new review
      const response = await productService.getProduct(id);
      setProduct(response.data);
    } catch (err) {
      setReviewError("Failed to submit review");
      console.error(err);
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-16">
        <Alert
          type="error"
          message="Error"
          description={error || "Product not found"}
          showIcon
        />
        <Link to="/products">
          <Button className="mt-4" icon={<ArrowLeftOutlined />}>
            Back to Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb className="mb-6">
        <Breadcrumb.Item>
          <Link to="/">
            <HomeOutlined /> Home
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/products">Products</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{product.name}</Breadcrumb.Item>
      </Breadcrumb>

      <Row gutter={[32, 32]}>
        <Col xs={24} md={12}>
          {product.images && product.images.length > 0 ? (
            <Carousel
              autoplay
              className="bg-gray-100 rounded-md overflow-hidden mb-4"
            >
              {product.images.map((image, index) => (
                <div key={index} className="h-96">
                  <img
                    src={`${API_ENDPOINTS.base}/uploads/${image}`}
                    alt={`${product.name} - Image ${index + 1}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </Carousel>
          ) : (
            <div className="h-96 bg-gray-100 flex items-center justify-center rounded-md mb-4">
              <p className="text-gray-500">No images available</p>
            </div>
          )}
        </Col>

        <Col xs={24} md={12}>
          <Title level={2}>{product.name}</Title>

          {product.averageRating && (
            <div className="mb-4">
              <Rate disabled defaultValue={product.averageRating} />
              <span className="ml-2 text-gray-500">
                ({product.reviews ? product.reviews.length : 0} reviews)
              </span>
            </div>
          )}

          <Title level={4} className="text-red-500 mb-6">
            ₹{product.price}
          </Title>

          <Paragraph className="mb-6">{product.description}</Paragraph>

          <div className="mb-6">
            <p className="text-gray-500 mb-2">Category: {product.category}</p>
            <p
              className={`${
                product.stock > 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {product.stock > 0
                ? `In Stock (${product.stock} available)`
                : "Out of Stock"}
            </p>
          </div>

          <div className="flex items-center mb-8">
            <span className="mr-4">Quantity:</span>
            <InputNumber
              min={1}
              max={product.stock}
              defaultValue={1}
              onChange={handleQuantityChange}
              disabled={product.stock === 0}
            />
          </div>

          <Button
            type="primary"
            size="large"
            icon={<ShoppingCartOutlined />}
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full md:w-auto"
          >
            Add to Cart
          </Button>
        </Col>
      </Row>

      <div className="mt-12">
        <Tabs defaultActiveKey="1">
          <TabPane tab="Description" key="1">
            <div className="p-6 bg-white rounded-md shadow-sm">
              <Paragraph>{product.description}</Paragraph>
            </div>
          </TabPane>

          <TabPane tab="Reviews" key="2">
            <div className="p-6 bg-white rounded-md shadow-sm">
              {product.reviews && product.reviews.length > 0 ? (
                <div>
                  {product.reviews.map((review) => (
                    <div key={review._id} className="mb-6 pb-6 border-b">
                      <Rate disabled defaultValue={review.rating} />
                      <Paragraph className="mt-2">{review.comment}</Paragraph>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No reviews yet.</p>
              )}

              {isAuthenticated ? (
                <div className="mt-8">
                  <Title level={4}>Write a Review</Title>

                  {reviewSuccess && (
                    <Alert
                      message="Review Submitted"
                      description="Your review has been submitted successfully."
                      type="success"
                      showIcon
                      className="mb-4"
                    />
                  )}

                  {reviewError && (
                    <Alert
                      message="Error"
                      description={reviewError}
                      type="error"
                      showIcon
                      className="mb-4"
                    />
                  )}

                  <Form
                    name="review"
                    onFinish={handleReviewSubmit}
                    layout="vertical"
                  >
                    <Form.Item
                      name="rating"
                      rules={[
                        { required: true, message: "Please rate this product" },
                      ]}
                    >
                      <Rate />
                    </Form.Item>

                    <Form.Item name="comment">
                      <TextArea
                        rows={4}
                        placeholder="Write your review here..."
                      />
                    </Form.Item>

                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={reviewSubmitting}
                        className="w-full md:w-auto"
                      >
                        Submit Review
                      </Button>
                    </Form.Item>
                  </Form>
                </div>
              ) : (
                <div className="mt-8 p-4 bg-gray-50 rounded-md">
                  <p>
                    Please{" "}
                    <Link to="/login" className="text-blue-500">
                      log in
                    </Link>{" "}
                    to write a review.
                  </p>
                </div>
              )}
            </div>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default ProductDetailPage;
