import { useState } from "react";
import {
  Form,
  Input,
  Button,
  InputNumber,
  Upload,
  Card,
  Typography,
  message,
  Select,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { createProduct } from "../../services/productService";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// Common product categories
const categories = [
  "Electronics",
  "Clothing",
  "Home & Kitchen",
  "Books",
  "Toys & Games",
  "Beauty & Personal Care",
  "Sports & Outdoors",
  "Jewelry",
  "Health & Wellness",
  "Automotive",
  "Other",
];

const AdminAddProductPage = () => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);

      if (fileList.length === 0) {
        message.error("Please upload at least one product image");
        setSubmitting(false);
        return;
      }

      // Create the product data with files
      const productData = {
        ...values,
        images: fileList.map((file) => file.originFileObj),
      };

      await createProduct(productData);
      message.success("Product added successfully");
      navigate("/admin/products");
    } catch (error) {
      console.error("Error adding product:", error);
      message.error("Failed to add product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  return (
    <div>
      <Title level={2} className="mb-6">
        Add New Product
      </Title>

      <Card className="shadow-sm">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            price: 0,
            stock: 1,
          }}
        >
          <Form.Item
            name="name"
            label="Product Name"
            rules={[
              { required: true, message: "Please enter the product name" },
              { max: 100, message: "Name cannot exceed 100 characters" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              {
                required: true,
                message: "Please enter the product description",
              },
            ]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item
              name="price"
              label="Price ($)"
              rules={[
                { required: true, message: "Please enter the product price" },
                {
                  type: "number",
                  min: 0,
                  message: "Price cannot be negative",
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                formatter={(value) =>
                  `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              />
            </Form.Item>

            <Form.Item
              name="stock"
              label="Stock Quantity"
              rules={[
                { required: true, message: "Please enter the stock quantity" },
                {
                  type: "number",
                  min: 0,
                  message: "Stock cannot be negative",
                },
              ]}
            >
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>
          </div>

          <Form.Item
            name="category"
            label="Category"
            rules={[
              { required: true, message: "Please select a product category" },
            ]}
          >
            <Select placeholder="Select a category">
              {categories.map((category) => (
                <Option key={category} value={category}>
                  {category}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Product Images"
            required
            tooltip="Upload at least one image for the product"
          >
            <Upload
              listType="picture"
              fileList={fileList}
              onChange={handleImageChange}
              beforeUpload={() => false}
              multiple
            >
              <Button icon={<UploadOutlined />}>Upload Images</Button>
            </Upload>
            <div className="text-gray-500 mt-2 text-sm">
              Please upload at least one image. You can upload multiple images.
            </div>
          </Form.Item>

          <Form.Item>
            <div className="flex flex-wrap gap-4 justify-end">
              <Button onClick={() => navigate("/admin/products")}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Add Product
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AdminAddProductPage;
