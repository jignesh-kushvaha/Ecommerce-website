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
      <div className="text-center py-16">
        <Alert
          type="error"
          message="Error"
          description={error || "Product not found"}
          showIcon
          className="mb-4"
        />
        <Link to="/products">
          <Button icon={<ArrowLeftOutlined />} type="primary">
            Back to Products
          </Button>
        </Link>
      </div>
    );
  }

  // Calculate total stock
  const totalStock =
    product.ProductVariants && product.ProductVariants.length > 0
      ? product.ProductVariants.reduce(
          (sum, v) => sum + (v.Inventory?.quantity_available || 0),
          0,
        )
      : 0;

  const inStock = totalStock > 0;
  const selectedVariantStock =
    selectedVariant?.Inventory?.quantity_available || 0;

  // Get all unique colors and storages
  const colors = [
    ...new Set(product.ProductVariants?.map((v) => v.color) || []),
  ];
  const allStorages = [
    ...new Set(product.ProductVariants?.map((v) => v.storage_gb) || []),
  ];

  // Get available storages for the selected color
  const availableStoragesForColor = selectedVariant
    ? [
        ...new Set(
          product.ProductVariants.filter(
            (v) => v.color === selectedVariant.color,
          ).map((v) => v.storage_gb),
        ),
      ]
    : allStorages;

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
    <div className="bg-gray-50 min-h-screen py-6">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <Breadcrumb.Item>
          <Link to="/">
            <HomeOutlined /> Home
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/products">Products</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{product.Category?.name}</Breadcrumb.Item>
        <Breadcrumb.Item>{product.name}</Breadcrumb.Item>
      </Breadcrumb>

      <Row gutter={[32, 32]}>
        {/* Image Gallery */}
        <Col xs={24} md={12}>
          <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
            {product.images && product.images.length > 0 ? (
              <Carousel
                autoplay
                className="bg-gray-100 rounded-md overflow-hidden mb-4"
              >
                {product.images.map((image, index) => (
                  <div
                    key={index}
                    className="h-96 flex items-center justify-center"
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
              <div className="h-96 bg-gray-200 flex items-center justify-center rounded-md mb-4">
                <p className="text-gray-500">No images available</p>
              </div>
            )}

            {/* Stock Badge */}
            <div className="text-center">
              {inStock ? (
                <Tag color="green" icon={<CheckCircleOutlined />}>
                  In Stock ({totalStock} available)
                </Tag>
              ) : (
                <Tag color="red" icon={<ClockCircleOutlined />}>
                  Out of Stock
                </Tag>
              )}
            </div>
          </div>
        </Col>

        {/* Product Details */}
        <Col xs={24} md={12}>
          <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Category & Brand */}
            <Space>
              <Text
                type="secondary"
                className="text-xs uppercase tracking-wider"
              >
                {product.Category?.name || "Electronics"}
              </Text>
              {product.brand && (
                <>
                  <Divider type="vertical" />
                  <Text strong>{product.brand}</Text>
                </>
              )}
            </Space>

            {/* Title */}
            <Title level={2} className="mt-3 mb-4">
              {product.name}
            </Title>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-6">
              <Rate
                disabled
                defaultValue={product.averageRating || 4}
                allowHalf
                className="text-lg"
              />
              <Text type="secondary">
                ({product.reviews?.length || 0} reviews)
              </Text>
              <Button
                type="text"
                icon={liked ? <HeartFilled /> : <HeartOutlined />}
                onClick={() => setLiked(!liked)}
                className={liked ? "text-red-500" : ""}
              >
                {liked ? "Liked" : "Like"}
              </Button>
            </div>

            {/* Description */}
            <Paragraph className="text-gray-700 mb-6">
              {product.description}
            </Paragraph>

            <Divider />

            {/* Pricing */}
            <div className="mb-6">
              <Text type="secondary" className="text-sm">
                Price
              </Text>
              <Title level={2} className="text-red-600 my-2">
                ₹{selectedVariant?.price || product.base_price}
              </Title>
              {product.ProductVariants &&
                product.ProductVariants.length > 1 && (
                  <Text type="secondary" className="text-xs">
                    Price varies by variant
                  </Text>
                )}
            </div>

            {/* Variants */}
            {product.ProductVariants && product.ProductVariants.length > 0 && (
              <div className="mb-6">
                {/* Color Selection */}
                {colors.length > 0 && (
                  <div className="mb-5">
                    <Text strong className="block mb-3">
                      Color ({selectedVariant?.color})
                    </Text>
                    <Space wrap>
                      {colors.map((color) => {
                        const colorVariant = product.ProductVariants.find(
                          (v) =>
                            v.color === color &&
                            v.storage_gb === selectedVariant?.storage_gb,
                        );
                        const isAvailable = !!colorVariant;
                        const isSelected = selectedVariant?.color === color;

                        return (
                          <Tooltip
                            key={color}
                            title={
                              !isAvailable
                                ? `Not available for ${selectedVariant?.storage_gb}GB storage`
                                : color
                            }
                          >
                            <Button
                              size="large"
                              disabled={!isAvailable}
                              className={`rounded-full border-2 transition-all ${
                                isSelected
                                  ? "border-blue-600 ring-2 ring-blue-300"
                                  : "border-gray-300"
                              } ${!isAvailable ? "opacity-40 cursor-not-allowed" : ""}`}
                              style={{
                                backgroundColor:
                                  colorVariant?.hex_color || "#CCCCCC",
                                width: "50px",
                                height: "50px",
                                padding: 0,
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
                    </Space>
                  </div>
                )}

                {/* Storage Selection */}
                {storages.length > 0 && (
                  <div className="mb-5">
                    <Text strong className="block mb-3">
                      Storage ({selectedVariant?.storage_gb}GB)
                    </Text>
                    <Space wrap>
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
                              size="large"
                              type={isSelected ? "primary" : "default"}
                              disabled={!isAvailable}
                              onClick={() => {
                                if (isAvailable && storageVariant) {
                                  handleVariantChange(storageVariant);
                                }
                              }}
                              className={`rounded-lg transition-all ${
                                !isAvailable ? "opacity-40" : ""
                              }`}
                            >
                              {storage}GB
                            </Button>
                          </Tooltip>
                        );
                      })}
                    </Space>
                  </div>
                )}

                {/* Selected Variant Details */}
                {selectedVariant && (
                  <Card
                    size="small"
                    className="bg-blue-50 border-blue-200 mb-5"
                  >
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <Text>
                        <strong>SKU:</strong> {selectedVariant.sku}
                      </Text>
                      {selectedVariant.ram_gb && (
                        <Text>
                          <strong>RAM:</strong> {selectedVariant.ram_gb}GB
                        </Text>
                      )}
                      <Text>
                        <strong>Stock Available:</strong>{" "}
                        {selectedVariantStock > 0 ? (
                          <span className="text-green-600">
                            {selectedVariantStock} units
                          </span>
                        ) : (
                          <span className="text-red-600">Out of Stock</span>
                        )}
                      </Text>
                    </Space>
                  </Card>
                )}
              </div>
            )}

            <Divider />

            {/* Quantity & Actions */}
            <div className="mb-6">
              <div className="mb-4">
                <Text strong className="block mb-3">
                  Quantity
                </Text>
                <InputNumber
                  min={1}
                  max={selectedVariantStock || totalStock}
                  value={quantity}
                  onChange={handleQuantityChange}
                  disabled={!inStock}
                  size="large"
                  className="w-20"
                />
              </div>

              <Space style={{ width: "100%" }} direction="vertical">
                <Button
                  type="primary"
                  size="large"
                  icon={<ShoppingCartOutlined />}
                  onClick={handleAddToCart}
                  disabled={!inStock || !selectedVariant}
                  block
                  className="rounded-lg font-semibold h-12"
                >
                  {inStock ? "Add to Cart" : "Out of Stock"}
                </Button>
                <Button size="large" block className="rounded-lg h-12">
                  Buy Now
                </Button>
              </Space>
            </div>

            <Divider />

            {/* Benefits */}
            <Space
              direction="vertical"
              style={{ width: "100%" }}
              className="text-sm"
            >
              <div className="flex items-center gap-3">
                <TruckOutlined className="text-lg text-blue-600" />
                <span>Free Delivery on orders above ₹500</span>
              </div>
              <div className="flex items-center gap-3">
                <SafetyOutlined className="text-lg text-blue-600" />
                <span>30-day Return Policy</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircleOutlined className="text-lg text-blue-600" />
                <span>Original & Authentic Products</span>
              </div>
            </Space>
          </div>
        </Col>
      </Row>

      {/* Reviews & Specifications */}
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
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
                { key: "3", spec: "Total Stock", value: `${totalStock} units` },
                {
                  key: "4",
                  spec: "Available Colors",
                  value: colors.length > 0 ? colors.join(", ") : "N/A",
                },
                {
                  key: "5",
                  spec: "Available Storage",
                  value:
                    storages.length > 0 ? storages.join(", ") + "GB" : "N/A",
                },
              ]}
              pagination={false}
              bordered={false}
            />
          </TabPane>

          <TabPane tab={`Reviews (${product.reviews?.length || 0})`} key="2">
            {product.reviews && product.reviews.length > 0 ? (
              <Space direction="vertical" style={{ width: "100%" }}>
                {product.reviews.map((review) => (
                  <Card key={review.id} size="small">
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <div className="flex justify-between items-start">
                        <Rate disabled defaultValue={review.rating} />
                        <Text type="secondary" className="text-xs">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </Text>
                      </div>
                      <Paragraph className="mb-0">{review.comment}</Paragraph>
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
              <div className="mt-8">
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
                      { required: true, message: "Please rate this product" },
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
              <div className="mt-8 p-4 bg-gray-50 rounded-md text-center">
                <p>
                  Please{" "}
                  <Link to="/login" className="text-blue-500 font-semibold">
                    log in
                  </Link>{" "}
                  to write a review.
                </p>
              </div>
            )}
          </TabPane>
        </Tabs>
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
