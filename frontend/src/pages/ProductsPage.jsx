import { Typography } from "antd";
import ProductList from "../components/products/ProductList.jsx";

const { Title } = Typography;

const ProductsPage = () => {
  return (
    <div>
      <Title level={2} className="mb-6">
        All Products
      </Title>
      <ProductList />
    </div>
  );
};

export default ProductsPage;
