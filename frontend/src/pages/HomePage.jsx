import { useEffect, useState } from "react";
import {
  Button,
  Carousel,
  Card,
  Row,
  Col,
  Typography,
  Spin,
  Divider,
} from "antd";
import { Link } from "react-router-dom";
import { ShoppingCartOutlined } from "@ant-design/icons";
import * as productService from "../services/productService";
import ProductCard from "../components/products/ProductCard";

const { Title, Paragraph } = Typography;

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        // Get the most expensive products as featured
        const response = await productService.getProducts({
          limit: 4,
          sort: "-price",
        });
        setFeaturedProducts(response.data);
      } catch (error) {
        console.error("Failed to fetch featured products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const carouselItems = [
    {
      title: "New Arrivals",
      description:
        "Check out our newest products with amazing quality and affordable prices.",
      image:
        "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      buttonText: "Shop Now",
      link: "/products",
    },
    {
      title: "Summer Sale",
      description: "Get up to 50% off on selected items. Limited time offer.",
      image:
        "https://images.unsplash.com/photo-1607082349566-187342175e2f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      buttonText: "View Deals",
      link: "/products",
    },
    {
      title: "Free Shipping",
      description: "Free shipping on all orders over $50. Shop now and save!",
      image:
        "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      buttonText: "Learn More",
      link: "/products",
    },
  ];

  return (
    <div>
      {/* Hero Carousel */}
      <Carousel autoplay>
        {carouselItems.map((item, index) => (
          <div key={index}>
            <div
              className="relative h-96 bg-cover bg-center"
              style={{ backgroundImage: `url(${item.image})` }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center">
                <div className="container mx-auto px-6 md:px-12">
                  <div className="w-full md:w-2/3 text-white">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                      {item.title}
                    </h1>
                    <p className="text-xl mb-6">{item.description}</p>
                    <Link to={item.link}>
                      <Button
                        type="primary"
                        size="large"
                        icon={<ShoppingCartOutlined />}
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        {item.buttonText}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Carousel>

      {/* Features Section */}
      <div className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <Title level={2} className="text-center mb-12">
            Why Choose Us
          </Title>

          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <Card className="h-full text-center">
                <div className="text-5xl text-blue-500 mb-4">🛒</div>
                <Title level={4}>Wide Selection</Title>
                <Paragraph>
                  Browse through thousands of high-quality products across
                  multiple categories.
                </Paragraph>
              </Card>
            </Col>

            <Col xs={24} md={8}>
              <Card className="h-full text-center">
                <div className="text-5xl text-blue-500 mb-4">🚚</div>
                <Title level={4}>Fast Delivery</Title>
                <Paragraph>
                  Get your orders delivered to your doorstep quickly and
                  efficiently.
                </Paragraph>
              </Card>
            </Col>

            <Col xs={24} md={8}>
              <Card className="h-full text-center">
                <div className="text-5xl text-blue-500 mb-4">💰</div>
                <Title level={4}>Best Prices</Title>
                <Paragraph>
                  We offer competitive prices and regular discounts on all
                  products.
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      {/* Featured Products */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <Title level={2} className="m-0">
              Products
            </Title>
            <Link to="/products">
              <Button type="link">View All</Button>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <Spin size="large" />
            </div>
          ) : (
            <Row gutter={[24, 24]}>
              {featuredProducts.map((product) => (
                <Col xs={24} sm={12} md={6} key={product._id}>
                  <ProductCard product={product} />
                </Col>
              ))}
            </Row>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
