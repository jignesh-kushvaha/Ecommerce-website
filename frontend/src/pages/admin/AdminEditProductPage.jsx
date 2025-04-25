import { useState, useEffect } from "react";
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
  Spin,
  Divider,
} from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import { getProduct, updateProduct } from "../../services/productService";
import { useNavigate, useParams } from "react-router-dom";
import API_ENDPOINTS from "../../config/apiConfig";

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

const AdminEditProductPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const [existingImages, setExistingImages] = useState([]);
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await getProduct(id);
        const product = response.data;
        // Set existing images
        if (product.images && product.images.length > 0) {
          setExistingImages(
            product.images.map((image, index) => ({
              uid: `-${index}`,
              name: `Image ${index + 1}`,
              status: "done",
              url: `${API_ENDPOINTS.base}/uploads/${image}`,
              filename: image,
            }))
          );
        }

        // Set form values
        form.setFieldsValue({
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          category: product.category,
        });
      } catch (error) {
        console.error("Error fetching product:", error);
        message.error("Failed to load product data");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, form]);

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);

      // Update product data with both existing and new images
      const productData = {
        ...values,
        // Existing images that weren't deleted
        images: existingImages.map((img) => img.filename),
        // New images to upload
        newImages: fileList.map((file) => file.originFileObj),
      };

      await updateProduct(id, productData);
      message.success("Product updated successfully");
      navigate("/admin/products");
    } catch (error) {
      console.error("Error updating product:", error);
      message.error("Failed to update product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const handleRemoveExistingImage = (imageToRemove) => {
    setExistingImages(
      existingImages.filter((img) => img.uid !== imageToRemove.uid)
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-8">
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  return (
    <div>
      <Title level={2} className="mb-6">
        Edit Product
      </Title>

      <Card className="shadow-sm">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
              label="Price (₹)"
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
                  `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/₹\s?|(,*)/g, "")}
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
            label="Current Images"
            tooltip="These are the existing product images"
          >
            {existingImages.length > 0 ? (
              <div className="flex flex-wrap gap-4 mb-4">
                {existingImages.map((image) => (
                  <div key={image.uid} className="relative">
                    <div className="w-24 h-24 relative group">
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-full object-cover rounded border"
                      />
                      <div
                        className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full cursor-pointer"
                        onClick={() => handleRemoveExistingImage(image)}
                      >
                        <DeleteOutlined />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500">No current images</div>
            )}
          </Form.Item>

          <Divider />

          <Form.Item
            label="Upload New Images"
            tooltip="You can add new images to the product"
          >
            <Upload
              listType="picture"
              fileList={fileList}
              onChange={handleImageChange}
              beforeUpload={() => false}
              multiple
            >
              <Button icon={<UploadOutlined />}>Upload New Images</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <div className="flex flex-wrap gap-4 justify-end">
              <Button onClick={() => navigate("/admin/products")}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Update Product
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AdminEditProductPage;
