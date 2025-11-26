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
const controlStyle = {
  borderRadius: 25,
  height: 48,
  paddingInline: 14,
  width: "100%",
};
  const dropdownStyle = { borderRadius: 25 };
  const navButtonStyle = {
    backgroundColor: "#000",
    borderColor: "#000",
    color: "#fff",
    borderWidth: 2,
    borderRadius: 999,
    padding: "0.65rem 1.6rem",
    fontWeight: 700,
    height: 48,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  };

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
      message.error('Unable to load car brands.');
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
      message.error('Unable to load car models.');
    } finally {
      setLoadingModels(false);
    }
  };

  const handleBrandChange = (value) => {
    setSelectedBrand(value);
    fetchModels(value);
  };
  
  const steps = [
    { title: 'Basic Info', icon: <CarOutlined /> },
    { title: 'Vehicle Details', icon: <InfoCircleOutlined /> },
    { title: 'Documents & Insurance', icon: <FileTextOutlined /> },
    { title: 'Review & Submit', icon: <CheckCircleOutlined /> },
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
      
      message.success('Vehicle registered successfully!', 2);

      setTimeout(() => navigate('/home'), 2000);

    } catch (error) {
      console.error('❌ Error:', error);
      message.error(error.response?.data?.message || 'Unable to register vehicle. Please try again.');
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
              <Form.Item name="brandId" label="Brand" rules={[{ required: true, message: 'Please select a brand.' }]}>
                <Select
                  showSearch
                  placeholder="Select brand"
                  loading={loadingBrands}
                  onChange={handleBrandChange}
                  style={controlStyle}
                  dropdownStyle={dropdownStyle}
                >
                  {brands.map(brand => <Option key={brand.brandId} value={brand.brandId}>{brand.brandName}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="modelId" label="Model" rules={[{ required: true, message: 'Please select a model.' }]}>
                <Select
                  showSearch
                  placeholder="Select model"
                  loading={loadingModels}
                  disabled={!selectedBrand}
                  style={controlStyle}
                  dropdownStyle={dropdownStyle}
                >
                  {models.map(model => <Option key={model.modelId} value={model.modelId}>{model.modelName}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="licensePlate" label="License plate" rules={[{ required: true, message: 'Please enter the license plate.' }]}>
                <Input
                  prefix={<IdcardOutlined />}
                  placeholder="e.g. 29A-12345"
                  style={controlStyle}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="vin" label="VIN">
                <Input
                  prefix={<BarcodeOutlined />}
                  placeholder="e.g. 5YJ3E1EA1JF000123"
                  style={controlStyle}
                />
              </Form.Item>
            </Col>
          </Row>
        );
      case 1:
        return (
          <Row gutter={24}>
            <Col xs={24} sm={12}>
              <Form.Item name="color" label="Color">
                <Input
                  prefix={<BgColorsOutlined />}
                  placeholder="e.g. Black, White, Blue"
                  style={controlStyle}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="mileage" label="Mileage (km)">
                <InputNumber
                  prefix={<DashboardOutlined />}
                  min={0}
                  style={{ width: '100%', ...controlStyle }}
                  placeholder="0"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="purchaseDate" label="Purchase date">
                <DatePicker
                  prefix={<CalendarOutlined />}
                  format="DD/MM/YYYY"
                  style={{ width: '100%', ...controlStyle }}
                />
              </Form.Item>
            </Col>
          </Row>
        );
      case 2:
        return (
          <Row gutter={24}>
            <Col xs={24} sm={12}>
              <Form.Item name="insuranceNumber" label="Insurance number">
                <Input
                  prefix={<FileTextOutlined />}
                  placeholder="e.g. INS123456"
                  style={controlStyle}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="insuranceExpiry" label="Insurance expiry">
                <DatePicker
                  format="DD/MM/YYYY"
                  style={{ width: '100%', ...controlStyle }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="registrationExpiry" label="Registration expiry">
                <DatePicker
                  format="DD/MM/YYYY"
                  style={{ width: '100%', ...controlStyle }}
                />
              </Form.Item>
            </Col>
          </Row>
        );
      case 3:
        return (
          <Descriptions title="Review details" bordered column={1}>
            <Descriptions.Item label="Brand">{brandName || 'Not selected'}</Descriptions.Item>
            <Descriptions.Item label="Model">{modelName || 'Not selected'}</Descriptions.Item>
            <Descriptions.Item label="License plate">{formData.licensePlate || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="VIN">{formData.vin || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Color">{formData.color || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Mileage">{formData.mileage || '0'}</Descriptions.Item>
            <Descriptions.Item label="Purchase date">{formData.purchaseDate ? formData.purchaseDate.format('DD/MM/YYYY') : 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Insurance number">{formData.insuranceNumber || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Insurance expiry">{formData.insuranceExpiry ? formData.insuranceExpiry.format('DD/MM/YYYY') : 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Registration expiry">{formData.registrationExpiry ? formData.registrationExpiry.format('DD/MM/YYYY') : 'N/A'}</Descriptions.Item>
          </Descriptions>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <MainLayout>
        <div style={{ padding: '24px', background: '#f5f6f8' }}>
          <Card style={{ maxWidth: '1100px', margin: '0 auto', borderRadius: '8px' }}>
            <Title level={3} style={{ textAlign: 'center' }}>
              Register new vehicle
            </Title>
            <Steps current={currentStep} style={{ marginBottom: '40px', marginTop: '32px' }}>
              {steps.map(item => <Step key={item.title} title={item.title} icon={item.icon} />)}
            </Steps>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="register-vehicle-form"
            style={{ width: '100%' }}
          >
            <Spin spinning={loading}>
              <div style={{ minHeight: '250px', padding: '24px', background: '#fafafa', borderRadius: '8px' }}>
                  {renderStepContent(currentStep)}
                </div>
                <div style={{ marginTop: '24px', textAlign: 'right' }}>
                {currentStep > 0 && (
                  <Button
                    icon={<LeftOutlined />}
                    style={{ ...navButtonStyle, margin: "0 8px" }}
                    onClick={() => prev()}
                  >
                    Back
                  </Button>
                )}
                {currentStep < steps.length - 1 && (
                  <Button
                    className="btn btn-light"
                    icon={<RightOutlined />}
                    onClick={() => next()}
                    style={navButtonStyle}
                  >
                    Next
                  </Button>
                )}
                  {currentStep === steps.length - 1 && (
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      icon={<CheckCircleOutlined />}
                      style={{
                        ...navButtonStyle,
                        backgroundColor: "#16a34a",
                        borderColor: "#16a34a",
                      }}
                    >
                      Register
                    </Button>
                  )}
                </div>
              </Spin>
            </Form>
          </Card>
        </div>
      </MainLayout>
      <style>{`
        .register-vehicle-form .ant-select-selector {
          border-radius: 25px !important;
          height: 48px !important;
          padding-left: 14px !important;
          padding-right: 36px !important;
          display: flex;
          align-items: center;
          width: 100% !important;
        }
        .register-vehicle-form .ant-select-selection-search-input {
          height: 48px !important;
        }
        .register-vehicle-form .ant-select-arrow {
          margin-top: 0;
          right: 14px;
        }
        .register-vehicle-form .ant-select {
          height: 48px;
          width: 100%;
          display: block;
        }
        .register-vehicle-form .ant-select-selection-item,
        .register-vehicle-form .ant-select-selection-placeholder {
          line-height: 46px;
          width: 100%;
        }
      `}</style>
    </>
  );
};

export default RegisterVehicle;
