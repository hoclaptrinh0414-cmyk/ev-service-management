import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerProfileService } from '../../services/customerProfileService';
import { useAuth } from '../../contexts/AuthContext';
import MainLayout from '../../components/layout/MainLayout'; // Use MainLayout
import {
  Card,
  Avatar,
  Button,
  Descriptions,
  Form,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  Spin,
  Typography,
  message,
  Divider,
  Space,
  Statistic,
  Tag,
  Tooltip
} from 'antd';
import { UserOutlined, EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import moment from 'moment';
import 'antd/dist/reset.css';
import './Profile.css';

const { Title, Text, Link } = Typography;
const { Option } = Select;

const Profile = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState({});

  useEffect(() => {
    window.scrollTo(0, 0);
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const response = await customerProfileService.getProfile();
      if (response.success && response.data) {
        const profileData = {
          ...response.data,
          dateOfBirth: response.data.dateOfBirth ? moment(response.data.dateOfBirth) : null,
          customerTypeName: response.data.customerType?.typeName || response.data.customerTypeName || 'Standard',
        };
        setUserData(profileData);
        form.setFieldsValue(profileData);

        const currentUser = JSON.parse(localStorage.getItem('user')) || {};
        const updatedUser = { ...currentUser, ...profileData, dateOfBirth: profileData.dateOfBirth?.format('YYYY-MM-DD') };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        updateUser(updatedUser);
      } else {
        message.warning('Could not fetch profile data. Please try again later.');
      }
    } catch (error) {
      console.error('❌ [Profile] Error loading profile:', error);
      message.error('An error occurred while loading your profile.');
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        const profileData = { ...user, dateOfBirth: user.dateOfBirth ? moment(user.dateOfBirth) : null };
        setUserData(profileData);
        form.setFieldsValue(profileData);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setIsEditing(false);
    form.setFieldsValue(userData);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const profileUpdateData = {
        ...values,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null,
      };

      const response = await customerProfileService.updateProfile(profileUpdateData);
      if (response.success) {
        await loadUserData();
        setIsEditing(false);
        message.success('Profile updated successfully!');
      } else {
        message.error(response.message || 'Failed to update profile.');
      }
    } catch (error) {
      console.error('❌ [Profile] Error updating profile:', error);
      message.error('An error occurred while saving your profile.');
    } finally {
      setSaving(false);
    }
  };

  const PhoneValidator = (_, value) => {
    if (!value) return Promise.reject(new Error('Số điện thoại không được để trống'));
    const cleanPhone = value.replace(/\s/g, '');
    if (!/^\d+$/.test(cleanPhone)) return Promise.reject(new Error('Số điện thoại chỉ được chứa chữ số'));
    if (cleanPhone.length < 10 || cleanPhone.length > 11) return Promise.reject(new Error('Số điện thoại phải có 10 hoặc 11 chữ số'));
    if (!cleanPhone.startsWith('0')) return Promise.reject(new Error('Số điện thoại phải bắt đầu bằng số 0'));
    const validPrefixes = ['03', '05', '07', '08', '09'];
    if (!validPrefixes.includes(cleanPhone.substring(0, 2))) return Promise.reject(new Error('Đầu số điện thoại không hợp lệ (phải là 03, 05, 07, 08, 09)'));
    return Promise.resolve();
  };

  const renderLoyaltyTierTag = (tier) => {
    let color = 'default';
    if (tier === 'Silver') color = 'silver';
    else if (tier === 'Gold') color = 'gold';
    else if (tier === 'Platinum') color = 'processing';
    return <Tag color={color} className="loyalty-tag">{tier || 'Standard'}</Tag>;
  };

  const renderValue = (value, type = 'text') => {
    if (!value) return <Text type="secondary">N/A</Text>;
    if (type === 'email') return <Link href={`mailto:${value}`} className="profile-email-link">{value}</Link>;
    return value;
  };
  
  return (
    <MainLayout>
      <div className="profile-page-container">
        <Spin spinning={loading}>
          <Card
            className="profile-main-card"
            title={
              <Space direction="vertical" size={0}>
                <Title level={3} style={{ marginBottom: 0 }}>My Profile</Title>
                <Text type="secondary">View and manage your personal information and loyalty status.</Text>
              </Space>
            }
            extra={!isEditing && (
              <Tooltip title="Update your personal details">
                <Button icon={<EditOutlined />} type="primary" className="edit-profile-btn" onClick={handleEdit}>Edit Profile</Button>
              </Tooltip>
            )}
          >
            <div className="profile-layout">
              <Col className="profile-left-column">
                <div className="profile-avatar-block">
                  <Avatar size={128} icon={<UserOutlined />} className="profile-avatar" />
                  <Title level={4} style={{ marginBottom: 0, marginTop: '8px' }}>{userData.fullName || 'User Name'}</Title>
                  <Text type="secondary">{renderValue(userData.email, 'email')}</Text>
                </div>
                <Divider><span className="profile-section-title">Loyalty Status</span></Divider>
                 <div className="loyalty-block">
                    <Statistic title={<Text className="loyalty-label">Loyalty Tier</Text>} valueRender={() => renderLoyaltyTierTag(userData.customerTypeName)} />
                    <Statistic title={<Text className="loyalty-label">Loyalty Points</Text>} value={userData.loyaltyPoints || 0} className="loyalty-points-value" />
                    <Statistic 
                        title={<Text className="loyalty-label">Total Spent</Text>} 
                        value={userData.totalSpent || 0} 
                        precision={0} 
                        suffix="VNĐ"
                        className="total-spent-value"
                    />
                 </div>
              </Col>
              <Col className="profile-right-column">
                <Form form={form} layout="vertical" onFinish={handleSave} initialValues={userData}>
                  <Divider orientation="left"><span className="profile-section-title">Personal Information</span></Divider>
                  <div className="profile-inf">
                    {isEditing ? (
                      <Row gutter={16}>
                        <Col xs={24} sm={12}><Form.Item label="Full Name" name="fullName" rules={[{ required: true }]}><Input /></Form.Item></Col>
                        <Col xs={24} sm={12}><Form.Item label="Phone Number" name="phoneNumber" rules={[{ required: true, validator: PhoneValidator }]}><Input /></Form.Item></Col>
                        <Col xs={24} sm={12}><Form.Item label="Date of Birth" name="dateOfBirth"><DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" /></Form.Item></Col>
                        <Col xs={24} sm={12}><Form.Item label="Gender" name="gender"><Select placeholder="Select gender"><Option value="Male">Male</Option><Option value="Female">Female</Option><Option value="Other">Other</Option></Select></Form.Item></Col>
                        <Col span={24}><Form.Item label="Address" name="address"><Input.TextArea rows={3} /></Form.Item></Col>
                      </Row>
                    ) : (
                      <Descriptions column={1} bordered className="profile-descriptions">
                        <Descriptions.Item label="Full Name">{renderValue(userData.fullName)}</Descriptions.Item>
                        <Descriptions.Item label="Phone Number">{renderValue(userData.phoneNumber)}</Descriptions.Item>
                        <Descriptions.Item label="Date of Birth">{renderValue(userData.dateOfBirth ? userData.dateOfBirth.format('DD/MM/YYYY') : null)}</Descriptions.Item>
                        <Descriptions.Item label="Gender">{renderValue(userData.gender)}</Descriptions.Item>
                        <Descriptions.Item label="Address">{renderValue(userData.address)}</Descriptions.Item>
                      </Descriptions>
                    )}
                  </div>

                  <Divider orientation="left"><span className="profile-section-title">Account Information</span></Divider>
                   <Descriptions column={1} bordered className="profile-descriptions">
                      <Descriptions.Item label="Email">{renderValue(userData.email, 'email')}</Descriptions.Item>
                   </Descriptions>

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
          </Card>
        </Spin>
      </div>
    </MainLayout>
  );
};

export default Profile;