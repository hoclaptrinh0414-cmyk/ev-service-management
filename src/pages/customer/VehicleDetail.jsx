// src/pages/customer/VehicleDetail.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import appointmentService from '../../services/appointmentService'; 
import { useAuth } from '../../contexts/AuthContext';
import MainLayout from '../../components/layout/MainLayout';
import {
  Card,
  Avatar,
  Button,
  Descriptions,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Row,
  Col,
  Spin,
  Typography,
  message,
  Divider,
  Space,
  Tooltip
} from 'antd';
import { CarOutlined, EditOutlined, SaveOutlined, CloseOutlined, ArrowLeftOutlined, HistoryOutlined, ToolOutlined } from '@ant-design/icons';
import moment from 'moment';
import 'antd/dist/reset.css';
import './VehicleDetail.css'; // New dedicated CSS file
import VehicleHistoryModal from '../../components/VehicleHistoryModal'; // Import the modal

const { Title, Text } = Typography;

const VehicleDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [vehicleData, setVehicleData] = useState(null);
  const [isHistoryModalVisible, setHistoryModalVisible] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadVehicleData();
  }, [id]);

  const loadVehicleData = async () => {
    setLoading(true);
    try {
      const response = await appointmentService.getMyVehicles(); 
      const allVehicles = response.data || [];
      const vehicle = allVehicles.find(v => v.vehicleId === parseInt(id));

      if (vehicle) {
        const formattedData = {
          ...vehicle,
          purchaseDate: vehicle.purchaseDate ? moment(vehicle.purchaseDate) : null,
          insuranceExpiry: vehicle.insuranceExpiry ? moment(vehicle.insuranceExpiry) : null,
          registrationExpiry: vehicle.registrationExpiry ? moment(vehicle.registrationExpiry) : null,
        };
        setVehicleData(formattedData);
        form.setFieldsValue(formattedData);
      } else {
        message.error('Vehicle not found.');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('❌ [VehicleDetail] Error loading vehicle:', error);
      message.error('An error occurred while loading vehicle details.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setIsEditing(false);
    form.setFieldsValue(vehicleData);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      
      const updateData = {
        ...values,
        purchaseDate: values.purchaseDate ? values.purchaseDate.format('YYYY-MM-DD') : null,
        insuranceExpiry: values.insuranceExpiry ? values.insuranceExpiry.format('YYYY-MM-DD') : null,
        registrationExpiry: values.registrationExpiry ? values.registrationExpiry.format('YYYY-MM-DD') : null,
      };
      
      // This should ideally be a dedicated method, but using what's available
      const response = await appointmentService.updateMyVehicle(id, updateData);
      
      if (response.success) {
        await loadVehicleData();
        setIsEditing(false);
        message.success('Vehicle details updated successfully!');
      } else {
        message.error(response.message || 'Failed to update vehicle details.');
      }
    } catch (error) {
      console.error('❌ [VehicleDetail] Error updating vehicle:', error);
      message.error('An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };
  
  const renderValue = (value) => value || <Text type="secondary">N/A</Text>;

  return (
    <MainLayout>
      <div className="profile-page-container">
        <Spin spinning={loading}>
          <Card
            className="profile-main-card"
            title={
              <Space direction="vertical" size={0}>
                <Title level={3} style={{ marginBottom: 0 }}>Vehicle Details</Title>
                <Text type="secondary">View and manage your vehicle's information.</Text>
              </Space>
            }
            extra={
              <Space>
                {!isEditing && (
                  <Tooltip title="Edit vehicle details">
                    <Button icon={<EditOutlined />} type="primary" onClick={handleEdit}>Edit Vehicle</Button>
                  </Tooltip>
                )}
                 <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
              </Space>
            }
          >
            {vehicleData && (
              <div className="profile-layout">
                <Col className="profile-left-column">
                  <div className="profile-avatar-block">
                    <Avatar size={128} icon={<CarOutlined />} className="profile-avatar" />
                    <Title level={4} style={{ marginBottom: 0, marginTop: '8px' }}>{vehicleData.modelName || 'Vehicle Model'}</Title>
                    <Text type="secondary">{renderValue(vehicleData.licensePlate)}</Text>
                  </div>
                </Col>
                <Col className="profile-right-column">
                  <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Divider orientation="left"><span className="profile-section-title">Vehicle Information</span></Divider>
                    {isEditing ? (
                      <Row gutter={16}>
                        <Col xs={24} sm={12}><Form.Item label="Model Name" name="modelName"><Input disabled /></Form.Item></Col>
                        <Col xs={24} sm={12}><Form.Item label="License Plate" name="licensePlate" rules={[{ required: true }]}><Input /></Form.Item></Col>
                        <Col xs={24} sm={12}><Form.Item label="VIN" name="vin"><Input /></Form.Item></Col>
                        <Col xs={24} sm={12}><Form.Item label="Color" name="color"><Input /></Form.Item></Col>
                        <Col xs={24} sm={12}><Form.Item label="Mileage (km)" name="mileage"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
                        <Col xs={24} sm={12}><Form.Item label="Purchase Date" name="purchaseDate"><DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" disabled /></Form.Item></Col>
                      </Row>
                    ) : (
                      <Descriptions column={2} bordered size="small" className="profile-descriptions">
                        <Descriptions.Item label="Model Name">{renderValue(vehicleData.modelName)}</Descriptions.Item>
                        <Descriptions.Item label="License Plate">{renderValue(vehicleData.licensePlate)}</Descriptions.Item>
                        <Descriptions.Item label="VIN">{renderValue(vehicleData.vin)}</Descriptions.Item>
                        <Descriptions.Item label="Color">{renderValue(vehicleData.color)}</Descriptions.Item>
                        <Descriptions.Item label="Mileage (km)">{renderValue(vehicleData.mileage?.toLocaleString())}</Descriptions.Item>
                        <Descriptions.Item label="Purchase Date">{renderValue(vehicleData.purchaseDate ? vehicleData.purchaseDate.format('DD/MM/YYYY') : null)}</Descriptions.Item>
                      </Descriptions>
                    )}

                    <Divider orientation="left"><span className="profile-section-title">Registration & Insurance</span></Divider>
                     {isEditing ? (
                      <Row gutter={16}>
                        <Col xs={24} sm={12}><Form.Item label="Insurance Number" name="insuranceNumber"><Input disabled/></Form.Item></Col>
                        <Col xs={24} sm={12}><Form.Item label="Insurance Expiry" name="insuranceExpiry"><DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" disabled /></Form.Item></Col>
                        <Col xs={24} sm={12}><Form.Item label="Registration Expiry" name="registrationExpiry"><DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" disabled/></Form.Item></Col>
                      </Row>
                    ) : (
                      <Descriptions column={1} bordered size="small" className="profile-descriptions">
                        <Descriptions.Item label="Insurance Number">{renderValue(vehicleData.insuranceNumber)}</Descriptions.Item>
                        <Descriptions.Item label="Insurance Expiry">{renderValue(vehicleData.insuranceExpiry ? vehicleData.insuranceExpiry.format('DD/MM/YYYY') : null)}</Descriptions.Item>
                        <Descriptions.Item label="Registration Expiry">{renderValue(vehicleData.registrationExpiry ? vehicleData.registrationExpiry.format('DD/MM/YYYY') : null)}</Descriptions.Item>
                      </Descriptions>
                    )}

                    {isEditing && (
                      <Form.Item style={{ marginTop: 32, textAlign: 'right' }}>
                          <Space>
                              <Button icon={<CloseOutlined />} onClick={handleCancel}>Cancel</Button>
                              <Button icon={<SaveOutlined />} type="primary" htmlType="submit" loading={saving}>Save Changes</Button>
                          </Space>
                      </Form.Item>
                    )}
                  </Form>
                </Col>
              </div>
            )}
          </Card>
          
          <Card title="Vehicle Actions" style={{ marginTop: '24px' }}>
            <Space wrap>
              <Button 
                icon={<ToolOutlined />} 
                size="large"
                onClick={() => navigate('/schedule-service', { state: { vehicleId: id } })}
              >
                Schedule Service
              </Button>
              <Button 
                icon={<HistoryOutlined />} 
                size="large"
                onClick={() => setHistoryModalVisible(true)}
              >
                View Maintenance History
              </Button>
            </Space>
          </Card>

        </Spin>
      </div>
      <VehicleHistoryModal
        show={isHistoryModalVisible}
        onHide={() => setHistoryModalVisible(false)}
        vehicleId={id}
      />
    </MainLayout>
  );
};

export default VehicleDetail;
