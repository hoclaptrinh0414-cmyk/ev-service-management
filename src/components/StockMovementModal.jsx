// ghi nhận xuất/nhập -> Admin 



import React from 'react';
import {
  Modal,
  Form,
  Select,
  InputNumber,
  Input,
  Radio
} from 'antd';

const { Option } = Select;

const StockMovementModal = ({ visible, onCancel, onFinish, parts, movementType }) => {
  const [form] = Form.useForm();

  const title = movementType === 'in' ? 'Nhập kho Phụ tùng' : 'Xuất kho Phụ tùng';

  const handleOk = () => {
    form
      .validateFields()
      .then(values => {
        form.resetFields();
        onFinish(values);
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  return (
    <Modal
      visible={visible}
      title={title}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Xác nhận"
      cancelText="Hủy"
    >
      <Form
        form={form}
        layout="vertical"
        name="stock_movement_form"
      >
        <Form.Item
          name="partId"
          label="Chọn Phụ tùng"
          rules={[{ required: true, message: 'Vui lòng chọn một phụ tùng!' }]}
        >
          <Select
            showSearch
            placeholder="Tìm và chọn phụ tùng"
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {parts.map(part => (
              <Option key={part.key} value={part.key}>
                {`${part.name} (SKU: ${part.sku})`}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="quantity"
          label="Số lượng"
          rules={[
            { required: true, message: 'Vui lòng nhập số lượng!' },
            { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0!' },
          ]}
        >
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="notes"
          label="Ghi chú"
        >
          <Input.TextArea rows={3} placeholder={movementType === 'in' ? 'VD: Nhập từ nhà cung cấp ABC' : 'VD: Xuất cho xe 51F-12345'} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default StockMovementModal;