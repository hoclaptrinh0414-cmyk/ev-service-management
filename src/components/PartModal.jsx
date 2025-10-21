import React from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Upload,
  Button,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { Option } = Select;

const PartModal = ({ visible, onCancel, onFinish, initialValues }) => {
  const [form] = Form.useForm();

  // Set initial values when the modal opens for editing
  React.useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
    }
  }, [initialValues, form]);

  const title = initialValues ? 'Sửa thông tin Phụ tùng' : 'Thêm Phụ tùng mới';

  return (
    <Modal
      visible={visible}
      title={title}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Lưu"
      cancelText="Hủy"
      width={720}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={initialValues}
      >
        <Form.Item
          name="name"
          label="Tên Phụ tùng"
          rules={[{ required: true, message: 'Vui lòng nhập tên phụ tùng!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="sku"
          label="Mã SKU"
          rules={[{ required: true, message: 'Vui lòng nhập mã SKU!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="category"
          label="Danh mục"
          rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
        >
          <Select>
            <Option value="Lốp xe">Lốp xe</Option>
            <Option value="Dầu nhớt">Dầu nhớt</Option>
            <Option value="Phụ tùng động cơ">Phụ tùng động cơ</Option>
            <Option value="Lọc">Lọc</Option>
            <Option value="Phanh">Phanh</Option>
            <Option value="Điện">Điện</Option>
          </Select>
        </Form.Item>

        <Form.Item name="description" label="Mô tả">
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item name="price" label="Giá bán" rules={[{ required: true, message: 'Vui lòng nhập giá bán!' }]}>
            <InputNumber
                style={{ width: '100%' }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value.replace(/\s?|(,*)/g, '')}
            />
        </Form.Item>

        <Form.Item name="quantity" label="Số lượng tồn kho ban đầu" rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}>
          <InputNumber style={{ width: '100%' }} min={0} />
        </Form.Item>

        <Form.Item name="lowStockThreshold" label="Ngưỡng cảnh báo tồn kho" rules={[{ required: true, message: 'Vui lòng nhập ngưỡng cảnh báo!' }]}>
          <InputNumber style={{ width: '100%' }} min={0} />
        </Form.Item>

        <Form.Item name="location" label="Vị trí kho">
          <Input />
        </Form.Item>

        <Form.Item label="Hình ảnh">
            <Upload name="logo" action="/upload.do" listType="picture">
                <Button icon={<UploadOutlined />}>Click to upload</Button>
            </Upload>
        </Form.Item>

      </Form>
    </Modal>
  );
};

export default PartModal;