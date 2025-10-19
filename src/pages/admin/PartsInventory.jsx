import React, { useState } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Typography,
  Avatar,
  Tag,
  Modal,
  message,
} from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import PartModal from '../../components/PartModal';
import StockMovementModal from '../../components/StockMovementModal';
import './PartsInventory.css';

const { Title } = Typography;
const { Option } = Select;

// Mock Data
const initialPartsData = [
  {
    key: '1',
    sku: 'SKU001',
    imageUrl: 'https://via.placeholder.com/40',
    name: 'Lốp xe Michelin Primacy 4',
    category: 'Lốp xe',
    quantity: 50,
    price: 3500000,
    location: 'Kệ A1',
    lowStockThreshold: 10,
  },
  {
    key: '2',
    sku: 'SKU002',
    imageUrl: 'https://via.placeholder.com/40',
    name: 'Dầu nhớt động cơ Castrol Magnatec',
    category: 'Dầu nhớt',
    quantity: 8,
    price: 850000,
    location: 'Kệ B2',
    lowStockThreshold: 15,
  },
  {
    key: '3',
    sku: 'SKU003',
    imageUrl: 'https://via.placeholder.com/40',
    name: 'Bugi Iridium NGK',
    category: 'Phụ tùng động cơ',
    quantity: 120,
    price: 250000,
    location: 'Kệ C3',
    lowStockThreshold: 20,
  },
  {
    key: '4',
    sku: 'SKU004',
    imageUrl: 'https://via.placeholder.com/40',
    name: 'Lọc gió điều hòa Denso',
    category: 'Lọc',
    quantity: 0,
    price: 300000,
    location: 'Kệ A2',
    lowStockThreshold: 5,
  },
];

const PartsInventory = () => {
  const [partsData, setPartsData] = useState(initialPartsData);
  const [searchText, setSearchText] = useState('');
  const [filteredCategory, setFilteredCategory] = useState('all');
  const [filteredStockStatus, setFilteredStockStatus] = useState('all');

  // Part Modal states
  const [isPartModalVisible, setIsPartModalVisible] = useState(false);
  const [editingPart, setEditingPart] = useState(null);

  // Stock Modal states
  const [isStockModalVisible, setIsStockModalVisible] = useState(false);
  const [movementType, setMovementType] = useState('in'); // 'in' or 'out'

  const handleSearch = (e) => setSearchText(e.target.value);
  const handleCategoryFilter = (value) => setFilteredCategory(value);
  const handleStockStatusFilter = (value) => setFilteredStockStatus(value);

  // Part Modal handling
  const showPartModal = (part) => {
    setEditingPart(part);
    setIsPartModalVisible(true);
  };

  const handleCancelPartModal = () => {
    setIsPartModalVisible(false);
    setEditingPart(null);
  };

  const handleFinishPartModal = (values) => {
    if (editingPart) {
      setPartsData(partsData.map(p => p.key === editingPart.key ? { ...p, ...values } : p));
      message.success('Cập nhật phụ tùng thành công!');
    } else {
      const newPart = { ...values, key: Date.now().toString(), imageUrl: 'https://via.placeholder.com/40' };
      setPartsData([...partsData, newPart]);
      message.success('Thêm phụ tùng mới thành công!');
    }
    setIsPartModalVisible(false);
    setEditingPart(null);
  };

  // Stock Modal handling
  const showStockModal = (type) => {
    setMovementType(type);
    setIsStockModalVisible(true);
  };

  const handleCancelStockModal = () => {
    setIsStockModalVisible(false);
  };

  const handleFinishStockModal = (values) => {
    const { partId, quantity } = values;
    setPartsData(partsData.map(part => {
      if (part.key === partId) {
        const newQuantity = movementType === 'in' ? part.quantity + quantity : part.quantity - quantity;
        if (newQuantity < 0) {
          message.error('Số lượng xuất kho vượt quá tồn kho hiện tại!');
          return part;
        }
        return { ...part, quantity: newQuantity };
      }
      return part;
    }));
    message.success(`${movementType === 'in' ? 'Nhập kho' : 'Xuất kho'} thành công!`);
    setIsStockModalVisible(false);
  };

  const filteredData = partsData
    .filter(part =>
      part.name.toLowerCase().includes(searchText.toLowerCase()) ||
      part.sku.toLowerCase().includes(searchText.toLowerCase())
    )
    .filter(part => filteredCategory === 'all' || part.category === filteredCategory)
    .filter(part => {
      if (filteredStockStatus === 'all') return true;
      if (filteredStockStatus === 'inStock') return part.quantity > part.lowStockThreshold;
      if (filteredStockStatus === 'lowStock') return part.quantity > 0 && part.quantity <= part.lowStockThreshold;
      if (filteredStockStatus === 'outOfStock') return part.quantity === 0;
      return true;
    });

  const columns = [
    { title: 'Mã SKU', dataIndex: 'sku', key: 'sku' },
    { title: 'Hình ảnh', dataIndex: 'imageUrl', key: 'imageUrl', render: (text) => <Avatar src={text} /> },
    { title: 'Tên Phụ tùng', dataIndex: 'name', key: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
    { title: 'Danh mục', dataIndex: 'category', key: 'category', sorter: (a, b) => a.category.localeCompare(b.category) },
    {
      title: 'Tồn kho',
      dataIndex: 'quantity',
      key: 'quantity',
      sorter: (a, b) => a.quantity - b.quantity,
      render: (quantity, record) => {
        let color = '#52c41a'; // green
        if (quantity === 0) color = '#f5222d'; // red
        else if (quantity <= record.lowStockThreshold) color = '#faad14'; // orange
        return <Tag color={color}>{quantity}</Tag>;
      },
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      sorter: (a, b) => a.price - b.price,
      render: (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price),
    },
    { title: 'Vị trí kho', dataIndex: 'location', key: 'location' },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => showPartModal(record)}>Sửa</a>
          <a>Xóa</a>
          <a>Lịch sử</a>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#f0f2f5' }}>
      <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
        <Title level={3}>Quản lý Kho Phụ tùng</Title>
        <Space style={{ marginBottom: 16 }} wrap>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showPartModal(null)}>
            Thêm Phụ tùng
          </Button>
          <Button onClick={() => showStockModal('in')}>Nhập kho</Button>
          <Button onClick={() => showStockModal('out')}>Xuất kho</Button>
          <Input
            placeholder="Tìm theo Tên hoặc Mã SKU"
            onChange={handleSearch}
            style={{ width: 240 }}
            prefix={<SearchOutlined />}
          />
          <Select defaultValue="all" style={{ width: 150 }} onChange={handleCategoryFilter}>
            <Option value="all">Tất cả Danh mục</Option>
            {/* Dynamically generate categories from data */}
            {[...new Set(partsData.map(p => p.category))].map(cat => <Option key={cat} value={cat}>{cat}</Option>)}
          </Select>
          <Select defaultValue="all" style={{ width: 150 }} onChange={handleStockStatusFilter}>
            <Option value="all">Tất cả Trạng thái</Option>
            <Option value="inStock">Còn hàng</Option>
            <Option value="lowStock">Sắp hết hàng</Option>
            <Option value="outOfStock">Hết hàng</Option>
          </Select>
        </Space>
        <Table columns={columns} dataSource={filteredData} pagination={{ pageSize: 10 }} bordered />
      </div>

      <PartModal
        visible={isPartModalVisible}
        onCancel={handleCancelPartModal}
        onFinish={handleFinishPartModal}
        initialValues={editingPart}
      />

      <StockMovementModal
        visible={isStockModalVisible}
        onCancel={handleCancelStockModal}
        onFinish={handleFinishStockModal}
        parts={partsData}
        movementType={movementType}
      />
    </div>
  );
};

export default PartsInventory;