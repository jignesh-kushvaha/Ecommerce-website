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
  Space,
  Divider,
  Tag,
  Table,
  Badge,
  Card,
  Tooltip,
  Select,
} from "antd";
import {
  ShoppingCartOutlined,
  ArrowLeftOutlined,
  HomeOutlined,
  HeartOutlined,
  HeartFilled,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TruckOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import * as productService from "../services/productService";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import API_ENDPOINTS from "../config/apiConfig";

const { Title, Paragraph, Text } = Typography;
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
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [liked, setLiked] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await productService.getProduct(id);
        setProduct(response.data);

        // Set default variant if available
        if (
          response.data?.ProductVariants &&
          response.data.ProductVariants.length > 0
        ) {
          setSelectedVariant(response.data.ProductVariants[0]);
        }
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
    setQuantity(value || 1);
  };

  const handleVariantChange = (variant) => {
    setSelectedVariant(variant);
    setQuantity(1);
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

    if (product && selectedVariant && quantity > 0) {
      addToCart(product, quantity, selectedVariant);
      message.success({
        content: (
          <div className="flex items-center">
            <ShoppingCartOutlined className="mr-2 text-lg" />
            <span>
              <strong>
                {quantity} x {product.name}
              </strong>{" "}
              added to cart!
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
        <Spin size="large" tip="Loading product details..." />
      </div>
    );
  }

  if (error || !product) {
    return (
      <Alert
        message="Error"
        description={error || "Product not found"}
        type="error"
        showIcon
        className="m-6"
      />
    );
  }

  // Get selected variant stock
  const selectedVariantStock =
    selectedVariant?.Inventory.quantity_available || 0;

  // Get available colors
  const colors =
    product.ProductVariants && product.ProductVariants.length > 0
      ? [...new Set(product.ProductVariants.map((v) => v.color))]
      : [];

  // Get available storage for selected color
  const availableStoragesForColor =
    selectedVariant && product.ProductVariants
      ? [
          ...new Set(
            product.ProductVariants.filter(
              (v) => v.color === selectedVariant.color,
            ).map((v) => v.storage_gb),
          ),
        ]
      : product.ProductVariants
        ? [...new Set(product.ProductVariants.map((v) => v.storage_gb))]
        : [];

  // Get available colors for the selected storage
  const availableColorsForStorage = selectedVariant
    ? [
        ...new Set(
          product.ProductVariants.filter(
            (v) => v.storage_gb === selectedVariant.storage_gb,
          ).map((v) => v.color),
        ),
      ]
    : colors;

  // Sort storages numerically
  const storages = availableStoragesForColor.sort((a, b) => a - b);

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
        <Breadcrumb className="max-w-7xl mx-auto">
          <Breadcrumb.Item>
            <Link to="/">
              <HomeOutlined /> Home
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/products">Products</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>{product.Category?.name}</Breadcrumb.Item>
          <Breadcrumb.Item className="truncate">{product.name}</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Row gutter={[40, 40]}>
          {/* Left Side - Image Gallery */}
          <Col xs={24} sm={24} md={10} lg={10}>
            <div className="sticky top-20">
              {product.images && product.images.length > 0 ? (
                <Carousel
                  autoplay
                  className="bg-gray-100 rounded-lg overflow-hidden"
                >
                  {product.images.map((image, index) => (
                    <div
                      key={index}
                      className="h-96 sm:h-80 md:h-96 lg:h-96 flex items-center justify-center bg-gray-100"
                    >
                      <img
                        src={`${API_ENDPOINTS.base}/uploads/${image}`}
                        alt={`${product.name} - Image ${index + 1}`}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  ))}
                </Carousel>
              ) : (
                <div className="h-96 bg-gray-200 flex items-center justify-center rounded-lg">
                  <p className="text-gray-500">No images available</p>
                </div>
              )}

              {/* Stock Badge */}
              <div className="mt-4 text-center">
                {selectedVariantStock ? (
                  <Tag
                    color="green"
                    className="text-sm py-1 px-3"
                    icon={<CheckCircleOutlined />}
                  >
                    In Stock
                  </Tag>
                ) : (
                  <Tag
                    color="red"
                    className="text-sm py-1 px-3"
                    icon={<ClockCircleOutlined />}
                  >
                    Out of Stock
                  </Tag>
                )}
              </div>
            </div>
          </Col>

          {/* Right Side - Product Details */}
          <Col xs={24} sm={24} md={14} lg={14}>
            {/* Header Info */}
            <div className="mb-4">
              <Space>
                <Text
                  type="secondary"
                  className="text-xs uppercase tracking-wider font-medium"
                >
                  {product.Category?.name || "Electronics"}
                </Text>
                {product.brand && (
                  <>
                    <Divider type="vertical" className="my-0" />
                    <Text strong className="text-sm">
                      {product.brand}
                    </Text>
                  </>
                )}
              </Space>
            </div>

            {/* Title */}
            <Title level={2} className="mb-3">
              {product.name}
            </Title>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-3 mb-4">
              <Rate
                disabled
                defaultValue={product.averageRating || 4}
                allowHalf
              />
              <Text type="secondary" className="text-sm">
                ({product.reviews?.length || 0} reviews)
              </Text>
              <Divider type="vertical" className="my-0" />
              <Button
                type="text"
                size="small"
                icon={liked ? <HeartFilled /> : <HeartOutlined />}
                onClick={() => setLiked(!liked)}
                className={`${liked ? "text-red-500" : "text-gray-500"}`}
              >
                {liked ? "Liked" : "Like"}
              </Button>
            </div>

            {/* Description */}
            <Paragraph className="text-gray-600 text-sm mb-4">
              {product.description}
            </Paragraph>

            <Divider className="my-4" />

            {/* Price Section */}
            <div className="mb-4">
              <Title level={3} className="text-red-600 my-0">
                ₹{selectedVariant?.price || product.base_price}
              </Title>
              {product.ProductVariants &&
                product.ProductVariants.length > 1 && (
                  <Text type="secondary" className="text-xs">
                    Price varies by variant
                  </Text>
                )}
            </div>

            <Divider className="my-4" />

            {/* Variants Selection - Compact Layout */}
            {product.ProductVariants && product.ProductVariants.length > 0 && (
              <div className="mb-6">
                {/* Color Selection */}
                {colors.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <Text strong className="text-sm">
                        {colors.length} color
                        {colors.length !== 1 ? "s" : ""}
                        <span className="text-blue-600">
                          {selectedVariant?.color}
                        </span>
                      </Text>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {colors.map((color) => {
                        console.log("ProductVariants", product.ProductVariants);
                        const colorVariant = product.ProductVariants.find(
                          (v) =>
                            v.color === color &&
                            v.storage_gb === selectedVariant?.storage_gb,
                        );
                        console.log("colorVariant", colorVariant);
                        const isAvailable = !!colorVariant;
                        const isSelected = selectedVariant?.color === color;

                        return (
                          <Tooltip
                            key={color}
                            title={
                              !isAvailable
                                ? `Not available for ${selectedVariant?.storage_gb}GB`
                                : color
                            }
                          >
                            <button
                              disabled={!isAvailable}
                              className={`w-12 h-12 rounded-full border-2 transition-all flex-shrink-0 ${
                                isSelected
                                  ? "border-blue-600 ring-2 ring-blue-300 ring-offset-2"
                                  : isAvailable
                                    ? "border-gray-300 hover:border-gray-400"
                                    : "border-gray-200 opacity-30 cursor-not-allowed"
                              }`}
                              style={{
                                backgroundColor:
                                  colorVariant?.hex_color ||
                                  getColorCode(color),
                              }}
                              onClick={() => {
                                if (isAvailable && colorVariant) {
                                  handleVariantChange(colorVariant);
                                }
                              }}
                            />
                          </Tooltip>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Storage Selection */}
                {storages.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <Text strong className="text-sm">
                        Storage:{" "}
                        <span className="text-blue-600">
                          {selectedVariant?.storage_gb}GB
                        </span>
                      </Text>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {storages.map((storage) => {
                        const storageVariant = product.ProductVariants.find(
                          (v) =>
                            v.storage_gb === storage &&
                            v.color === selectedVariant?.color,
                        );
                        const isAvailable = !!storageVariant;
                        const isSelected =
                          selectedVariant?.storage_gb === storage;

                        return (
                          <Tooltip
                            key={storage}
                            title={
                              !isAvailable
                                ? `Not available for ${selectedVariant?.color}`
                                : `${storage}GB`
                            }
                          >
                            <Button
                              size="small"
                              type={isSelected ? "primary" : "default"}
                              disabled={!isAvailable}
                              onClick={() => {
                                if (isAvailable && storageVariant) {
                                  handleVariantChange(storageVariant);
                                }
                              }}
                              className={`transition-all ${
                                !isAvailable ? "opacity-40" : ""
                              }`}
                            >
                              {storage}GB
                            </Button>
                          </Tooltip>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Variant Details Summary */}
                {selectedVariant && (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Text type="secondary" className="text-xs">
                          SKU
                        </Text>
                        <p className="font-medium text-gray-900">
                          {selectedVariant.sku}
                        </p>
                      </div>
                      {selectedVariant.ram_gb && (
                        <div>
                          <Text type="secondary" className="text-xs">
                            RAM
                          </Text>
                          <p className="font-medium text-gray-900">
                            {selectedVariant.ram_gb}GB
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 pt-3 border-t border-blue-100">
                      <Text
                        className={`text-sm font-medium ${
                          selectedVariantStock > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {selectedVariantStock > 0 ? `In Stock` : "Out of Stock"}
                      </Text>
                    </div>
                  </div>
                )}
              </div>
            )}

            <Divider className="my-4" />

            {/* Quantity & Action Buttons */}
            <div className="mb-6">
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <Select
                    value={quantity}
                    onChange={handleQuantityChange}
                    disabled={selectedVariantStock === 0 || !selectedVariant}
                    size="large"
                    className="w-32"
                  >
                    {Array.from(
                      { length: Math.min(5, selectedVariantStock) },
                      (_, i) => i + 1,
                    ).map((num) => (
                      <Select.Option key={num} value={num}>
                        Quantity {num}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              </div>

              {/* Action Buttons */}
              <Space
                style={{ width: "100%" }}
                direction="vertical"
                size="middle"
              >
                <Button
                  type="primary"
                  size="large"
                  icon={<ShoppingCartOutlined />}
                  onClick={handleAddToCart}
                  disabled={selectedVariantStock === 0 || !selectedVariant}
                  block
                  className="h-12 font-semibold"
                >
                  {selectedVariantStock > 0 ? "Add to Cart" : "Out of Stock"}
                </Button>
                <Button
                  type="default"
                  size="large"
                  block
                  className="h-12 font-semibold border-2"
                  disabled={selectedVariantStock === 0 || !selectedVariant}
                >
                  Buy Now
                </Button>
              </Space>
            </div>

            {/* Trust Badges */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <TruckOutlined className="text-green-600 text-lg flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Free Delivery
                  </p>
                  <p className="text-xs text-gray-600">On orders above ₹500</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <SafetyOutlined className="text-blue-600 text-lg flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    30-day Returns
                  </p>
                  <p className="text-xs text-gray-600">Hassle-free returns</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircleOutlined className="text-blue-600 text-lg flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Authentic Products
                  </p>
                  <p className="text-xs text-gray-600">
                    100% original guarantee
                  </p>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Reviews & Specifications - Below Product Details */}
      <div className="bg-gray-50 border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <Tabs defaultActiveKey="1">
            <TabPane tab="Specifications" key="1">
              <Table
                columns={[
                  { title: "Specification", dataIndex: "spec", key: "spec" },
                  { title: "Details", dataIndex: "value", key: "value" },
                ]}
                dataSource={[
                  { key: "1", spec: "Brand", value: product.brand || "N/A" },
                  {
                    key: "2",
                    spec: "Category",
                    value: product.Category?.name || "N/A",
                  },
                  {
                    key: "3",
                    spec: "Available Colors",
                    value: colors.length > 0 ? colors.join(", ") : "N/A",
                  },
                  {
                    key: "4",
                    spec: "Available Storage",
                    value:
                      storages.length > 0 ? storages.join(", ") + "GB" : "N/A",
                  },
                ]}
                pagination={false}
                bordered={false}
                className="bg-white"
              />
            </TabPane>

            <TabPane tab={`Reviews (${product.reviews?.length || 0})`} key="2">
              <div className="bg-white p-6 rounded-lg">
                {product.reviews && product.reviews.length > 0 ? (
                  <Space direction="vertical" style={{ width: "100%" }}>
                    {product.reviews.map((review) => (
                      <Card key={review.id} size="small" className="mb-3">
                        <Space direction="vertical" style={{ width: "100%" }}>
                          <div className="flex justify-between items-start">
                            <Rate disabled defaultValue={review.rating} />
                            <Text type="secondary" className="text-xs">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </Text>
                          </div>
                          <Paragraph className="mb-0 text-sm">
                            {review.comment}
                          </Paragraph>
                        </Space>
                      </Card>
                    ))}
                  </Space>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No reviews yet. Be the first to review!
                  </p>
                )}

                {isAuthenticated ? (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <Title level={4}>Write a Review</Title>

                    {reviewSuccess && (
                      <Alert
                        message="Review Submitted"
                        description="Your review has been published successfully."
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
                        label="Rating"
                        rules={[
                          {
                            required: true,
                            message: "Please rate this product",
                          },
                        ]}
                      >
                        <Rate />
                      </Form.Item>

                      <Form.Item name="comment" label="Your Review">
                        <TextArea
                          rows={4}
                          placeholder="Share your experience with this product..."
                        />
                      </Form.Item>

                      <Form.Item>
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={reviewSubmitting}
                        >
                          Submit Review
                        </Button>
                      </Form.Item>
                    </Form>
                  </div>
                ) : (
                  <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                    <p className="text-gray-600">
                      Please{" "}
                      <Link to="/login" className="text-blue-600 font-semibold">
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
    </div>
  );
};

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

export default ProductDetailPage;
