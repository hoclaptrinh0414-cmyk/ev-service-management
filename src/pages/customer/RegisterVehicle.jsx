import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { vehicleAPI, carBrandAPI, carModelAPI } from '../../services/apiService';
import MainLayout from '../../components/layout/MainLayout';
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Card,
  Row,
  Col,
  Typography,
  message,
  InputNumber,
  Spin,
  Steps,
  Divider,
  Descriptions
} from 'antd';
import {
  CarOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  RightOutlined,
  LeftOutlined,
  IdcardOutlined,
  BarcodeOutlined,
  BgColorsOutlined,
  DashboardOutlined,
  CalendarOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import 'antd/dist/reset.css';

const { Title } = Typography;
const { Option } = Select;
const { Step } = Steps;

const RegisterVehicle = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setLoadingBrands(true);
    try {
      const result = await carBrandAPI.getActiveBrands();
      setBrands(result.data || []);
    } catch (error) {
      console.error('❌ Error fetching brands:', error);
      message.error('Không thể tải danh sách hãng xe.');
    } finally {
      setLoadingBrands(false);
    }
  };

  const fetchModels = async (brandId) => {
    setLoadingModels(true);
    form.setFieldsValue({ modelId: null });
    setModels([]);
    try {
      const result = await carModelAPI.getModelsByBrand(brandId);
      setModels(result.data || []);
    } catch (error) {
      console.error('❌ Error fetching models:', error);
      message.error('Không thể tải danh sách mẫu xe.');
    } finally {
      setLoadingModels(false);
    }
  };

  const handleBrandChange = (value) => {
    setSelectedBrand(value);
    fetchModels(value);
  };
  
  const steps = [
    { title: 'Thông tin cơ bản', icon: <CarOutlined /> },
    { title: 'Chi tiết xe', icon: <InfoCircleOutlined /> },
    { title: 'Giấy tờ & Bảo hiểm', icon: <FileTextOutlined /> },
    { title: 'Xem lại & Hoàn tất', icon: <CheckCircleOutlined /> },
  ];

  const next = async () => {
    try {
      // Validate fields of the current step before proceeding
      const fieldsToValidate = [
        ['brandId', 'modelId', 'licensePlate', 'vin'],
        ['color', 'mileage', 'purchaseDate'],
        ['insuranceNumber', 'insuranceExpiry', 'registrationExpiry'],
      ];
      if (currentStep < 3) {
          await form.validateFields(fieldsToValidate[currentStep]);
      }
      setCurrentStep(currentStep + 1);
    } catch (err) {
        // Validation failed
        console.log('Validation Failed:', err);
    }
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const values = form.getFieldsValue(true);
      const vehicleData = {
        ...values,
        modelId: parseInt(values.modelId),
        licensePlate: values.licensePlate.trim().toUpperCase(),
        mileage: values.mileage || 0,
        purchaseDate: values.purchaseDate ? values.purchaseDate.format('YYYY-MM-DD') : null,
        insuranceExpiry: values.insuranceExpiry ? values.insuranceExpiry.format('YYYY-MM-DD') : null,
        registrationExpiry: values.registrationExpiry ? values.registrationExpiry.format('YYYY-MM-DD') : null,
      };

      console.log('📦 Submitting vehicle:', vehicleData);
      await vehicleAPI.addVehicle(vehicleData);
      
      message.success('Đăng ký xe thành công!', 2);

      setTimeout(() => navigate('/home'), 2000);

    } catch (error) {
      console.error('❌ Error:', error);
      message.error(error.response?.data?.message || 'Không thể đăng ký xe. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    const formData = form.getFieldsValue(true);
    const brandName = brands.find(b => b.brandId === formData.brandId)?.brandName;
    const modelName = models.find(m => m.modelId === formData.modelId)?.modelName;

    switch (step) {
      case 0:
        return (
          <Row gutter={24}>
            <Col xs={24} sm={12}>
              <Form.Item name="brandId" label="Hãng xe" rules={[{ required: true, message: 'Vui lòng chọn hãng xe!' }]}>
                <Select showSearch placeholder="-- Chọn hãng xe --" loading={loadingBrands} onChange={handleBrandChange}>
                  {brands.map(brand => <Option key={brand.brandId} value={brand.brandId}>{brand.brandName}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="modelId" label="Mẫu xe" rules={[{ required: true, message: 'Vui lòng chọn mẫu xe!' }]}>
                <Select showSearch placeholder="-- Chọn mẫu xe --" loading={loadingModels} disabled={!selectedBrand}>
                  {models.map(model => <Option key={model.modelId} value={model.modelId}>{model.modelName}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="licensePlate" label="Biển số xe" rules={[{ required: true, message: 'Vui lòng nhập biển số xe!' }]}>
                <Input prefix={<IdcardOutlined />} placeholder="VD: 29A-12345" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="vin" label="VIN (Số khung)">
                <Input prefix={<BarcodeOutlined />} placeholder="VD: 5YJ3E1EA1JF000123" />
              </Form.Item>
            </Col>
          </Row>
        );
      case 1:
        return (
          <Row gutter={24}>
            <Col xs={24} sm={12}>
              <Form.Item name="color" label="Màu xe">
                <Input prefix={<BgColorsOutlined />} placeholder="VD: Đen, Trắng, Xanh" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="mileage" label="Số km đã chạy">
                <InputNumber prefix={<DashboardOutlined />} min={0} style={{ width: '100%' }} placeholder="0" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="purchaseDate" label="Ngày mua xe">
                <DatePicker prefix={<CalendarOutlined />} format="DD/MM/YYYY" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        );
      case 2:
        return (
          <Row gutter={24}>
            <Col xs={24} sm={12}>
              <Form.Item name="insuranceNumber" label="Số bảo hiểm">
                <Input prefix={<FileTextOutlined />} placeholder="VD: BH123456" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="insuranceExpiry" label="Hạn bảo hiểm">
                <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="registrationExpiry" label="Hạn đăng kiểm">
                <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        );
      case 3:
        return (
          <Descriptions title="Xác nhận thông tin" bordered column={1}>
            <Descriptions.Item label="Hãng xe">{brandName || 'Chưa chọn'}</Descriptions.Item>
            <Descriptions.Item label="Mẫu xe">{modelName || 'Chưa chọn'}</Descriptions.Item>
            <Descriptions.Item label="Biển số xe">{formData.licensePlate}</Descriptions.Item>
            <Descriptions.Item label="VIN (Số khung)">{formData.vin || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Màu xe">{formData.color || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Số km">{formData.mileage || '0'}</Descriptions.Item>
            <Descriptions.Item label="Ngày mua">{formData.purchaseDate ? formData.purchaseDate.format('DD/MM/YYYY') : 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Số bảo hiểm">{formData.insuranceNumber || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Hạn bảo hiểm">{formData.insuranceExpiry ? formData.insuranceExpiry.format('DD/MM/YYYY') : 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Hạn đăng kiểm">{formData.registrationExpiry ? formData.registrationExpiry.format('DD/MM/YYYY') : 'N/A'}</Descriptions.Item>
          </Descriptions>
        );
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div style={{ padding: '24px', background: '#f5f6f8' }}>
        <Card style={{ maxWidth: '1000px', margin: '0 auto', borderRadius: '8px' }}>
          <Title level={3} style={{ textAlign: 'center' }}>
            Đăng ký xe mới
          </Title>
          <Steps current={currentStep} style={{ marginBottom: '40px', marginTop: '32px' }}>
            {steps.map(item => <Step key={item.title} title={item.title} icon={item.icon} />)}
          </Steps>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Spin spinning={loading}>
              <div style={{ minHeight: '250px', padding: '24px', background: '#fafafa', borderRadius: '8px' }}>
                {renderStepContent(currentStep)}
              </div>
              <div style={{ marginTop: '24px', textAlign: 'right' }}>
                {currentStep > 0 && (
                  <Button icon={<LeftOutlined />} style={{ margin: '0 8px' }} onClick={() => prev()}>
                    Quay lại
                  </Button>
                )}
                {currentStep < steps.length - 1 && (
                  <Button type="primary" icon={<RightOutlined />} onClick={() => next()}>
                    Tiếp theo
                  </Button>
                )}
                {currentStep === steps.length - 1 && (
                  <Button type="primary" htmlType="submit" loading={loading} icon={<CheckCircleOutlined />}>
                    Hoàn tất đăng ký
                  </Button>
                )}
              </div>
            </Spin>
          </Form>
        </Card>
      </div>
    </MainLayout>
  );
};

export default RegisterVehicle;
