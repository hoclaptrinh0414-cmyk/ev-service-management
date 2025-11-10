// src/pages/customer/ScheduleServiceNew.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import appointmentService from '../../services/appointmentService';
import packageService from '../../services/packageService';
import paymentService from '../../services/paymentService';
import { maintenanceService } from '../../services/maintenanceService';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useSchedule } from '../../contexts/ScheduleContext';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './ScheduleServiceNew.css';

const ScheduleServiceNew = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems } = useCart();
  const { saveBookingState, restoreBookingState, hasBookingState, clearBookingState } = useSchedule();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Vehicle Selection
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');

  // Step 2: Service Center & Time Selection
  const [serviceCenters, setServiceCenters] = useState([]);
  const [selectedServiceCenterId, setSelectedServiceCenterId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState('');

  // Step 3: Service Selection
  const [allServices, setAllServices] = useState([]);
  const [activeSubscriptions, setActiveSubscriptions] = useState([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [notes, setNotes] = useState('');

  // Step 4: Summary
  const [estimatedCost, setEstimatedCost] = useState(0);

  // Step 5: Payment
  const [paymentMethod, setPaymentMethod] = useState('VNPay');
  const [appointmentData, setAppointmentData] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // ============ RESTORE STATE ON MOUNT ============
  useEffect(() => {
    // Check if there's a saved booking state (coming back from products page)
    if (hasBookingState()) {
      const savedState = restoreBookingState();
      if (savedState) {
        console.log('🔄 Restoring booking state:', savedState);

        // Restore all state
        setCurrentStep(savedState.currentStep);
        setSelectedVehicleId(savedState.selectedVehicleId);
        setSelectedServiceCenterId(savedState.selectedServiceCenterId);
        setSelectedDate(savedState.selectedDate);
        setSelectedTimeSlotId(savedState.selectedTimeSlotId);
        setNotes(savedState.notes);

        // We need to reload data for dropdowns
        loadVehicles();
        if (savedState.currentStep >= 2) {
          loadServiceCenters();
        }

        toast.success('Continuing your booking...');
        return;
      }
    }

    // Normal flow: start from beginning
    loadVehicles();
  }, []);

  // ============ STEP 1: LOAD VEHICLES ============

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getMyVehicles();
      setVehicles(response.data || []);
    } catch (error) {
      console.error('Error loading vehicles:', error);
      toast.error('Unable to load vehicles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ============ STEP 2: LOAD SERVICE CENTERS & TIME SLOTS ============
  useEffect(() => {
    if (currentStep === 2) {
      loadServiceCenters();
    }
  }, [currentStep]);

  useEffect(() => {
    console.log('⚡ useEffect triggered!');
    console.log('   → selectedServiceCenterId:', selectedServiceCenterId);
    console.log('   → selectedDate:', selectedDate);
    console.log('   → Both exist?', !!(selectedServiceCenterId && selectedDate));

    if (selectedServiceCenterId && selectedDate) {
      console.log('✅ Conditions met - calling loadAvailableTimeSlots()');
      loadAvailableTimeSlots();
    } else {
      console.log('⚠️ Conditions NOT met - skipping API call');
    }
  }, [selectedServiceCenterId, selectedDate]);

  const loadServiceCenters = async () => {
    try {
      setLoading(true);
      // Use getActiveServiceCenters to get only active centers
      const response = await appointmentService.getActiveServiceCenters();
      console.log('🏢 Service Centers Response:', response);
      console.log('🏢 Service Centers Data:', response.data);

      if (response.data && response.data.length > 0) {
        console.log('🏢 First Service Center:', response.data[0]);
        console.log('🏢 Service Center ID field:', response.data[0].serviceCenterId || response.data[0].id || response.data[0].centerId);
      }

      setServiceCenters(response.data || []);
    } catch (error) {
      console.error('Error loading service centers:', error);
      toast.error('Unable to load service centers.');
    } finally {
      setLoading(false);
    }
  };

  // Format date for display (YYYY-MM-DD to DD/MM/YYYY)
  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  // Format date for API (DD/MM/YYYY to YYYY-MM-DD)
  const formatDateForAPI = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/');
      return `${year}-${month}-${day}`;
    }
    return dateStr; // Already in YYYY-MM-DD
  };

  const loadAvailableTimeSlots = async () => {
    console.log('🚀 ========== LOAD TIME SLOTS FUNCTION CALLED ==========');
    console.log('📍 selectedServiceCenterId:', selectedServiceCenterId);
    console.log('📅 selectedDate:', selectedDate);

    if (!selectedServiceCenterId || !selectedDate) {
      console.warn('⚠️ Missing required params - aborting');
      return;
    }

    try {
      setLoading(true);

      console.log('🔍 [STEP 1] Starting to fetch time slots...');
      console.log('📍 Center ID (raw):', selectedServiceCenterId);
      console.log('📍 Center ID (type):', typeof selectedServiceCenterId);
      console.log('📅 Date (from input):', selectedDate);

      // Ensure centerID is a number
      const centerIdNumber = parseInt(selectedServiceCenterId);
      console.log('📍 Parsed Center ID:', centerIdNumber);
      console.log('📍 Is Valid Number?', !isNaN(centerIdNumber));

      if (isNaN(centerIdNumber)) {
        console.error('❌ INVALID CENTER ID - Cannot parse to number');
        console.error('❌ Original value:', selectedServiceCenterId);
        toast.error('Invalid service center selected. Please try again.');
        return;
      }

      console.log('🌐 [STEP 2] Making API call...');
      console.log('   → Center ID:', centerIdNumber);
      console.log('   → Date:', selectedDate);

      const response = await appointmentService.getAvailableSlots(
        centerIdNumber,
        selectedDate
      );

      console.log('✅ [STEP 3] Time slots API response received:', response);
      console.log('📊 Available slots count:', response.data?.length || 0);

      if (response.data && response.data.length > 0) {
        console.log('✅ [STEP 4] Setting time slots to state:', response.data);
        setAvailableTimeSlots(response.data);
      } else {
        console.warn('⚠️ [STEP 4] No time slots available for this date');
        setAvailableTimeSlots([]);
        toast.warning('No available time slots for this date. Please select another date.');
      }
    } catch (error) {
      console.error('❌ ========== ERROR LOADING TIME SLOTS ==========');
      console.error('❌ Error object:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error data:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error headers:', error.response?.headers);
      toast.error(error.response?.data?.message || 'Unable to load available time slots.');
      setAvailableTimeSlots([]);
    } finally {
      console.log('🏁 [FINAL] Setting loading to false');
      setLoading(false);
    }
  };

  // ============ STEP 3: LOAD SERVICES & SUBSCRIPTIONS ============
  useEffect(() => {
    if (currentStep === 3) {
      // Check if user is still authenticated
      const token = localStorage.getItem('accessToken');
      if (!token || !user) {
        console.warn('⚠️ User not authenticated, redirecting to login');
        toast.warning('Please login to continue booking');
        navigate('/login');
        return;
      }

      loadServicesAndSubscriptions();
    }
  }, [currentStep, selectedVehicleId]);

  const loadServicesAndSubscriptions = async () => {
    try {
      setLoading(true);

      // Get vehicle's modelId for service search
      const vehicle = vehicles.find(v => v.vehicleId === parseInt(selectedVehicleId));
      const modelId = vehicle?.modelId || vehicle?.model?.modelId;

      console.log('🔧 Loading services for vehicle:', { vehicle, modelId });

      // Load services - always load all active services for now
      let servicesResponse;
      try {
        // Load all active maintenance services
        const response = await maintenanceService.getAllServices({
          isActive: true,
          page: 1,
          pageSize: 100
        });

        // maintenanceService returns { success, data: { items, totalCount, ... } }
        const services = response?.data?.items || response?.items || [];
        servicesResponse = { data: services };

        console.log('✅ Services loaded successfully:', services.length, 'services');
      } catch (error) {
        console.error('❌ Error loading services:', error);
        if (error.response?.status === 401) {
          toast.error('Session expired. Please login again.');
          navigate('/login');
          return;
        }
        servicesResponse = { data: [] };
      }

      // Load subscriptions (optional - skip for now as API requires special permissions)
      let subscriptionsResponse = { data: [] };
      console.log('⏭️ Skipping subscriptions (optional feature, not available for all users)');

      console.log('🔧 Services response:', servicesResponse);
      console.log('🔧 Subscriptions response:', subscriptionsResponse);

      const services = Array.isArray(servicesResponse?.data) ? servicesResponse.data : [];
      const subscriptions = Array.isArray(subscriptionsResponse?.data) ? subscriptionsResponse.data : [];

      console.log('🔧 Setting services:', services);
      console.log('🔧 Setting subscriptions:', subscriptions);

      setAllServices(services);
      setActiveSubscriptions(subscriptions);

      // Only show error if services failed to load
      if (services.length === 0 && servicesResponse?.data !== null) {
        toast.warning('No services available for this vehicle model.');
      }
    } catch (error) {
      console.error('❌ Error loading services/subscriptions:', error);
      toast.error('Unable to load services.');
      // Ensure arrays even on error
      setAllServices([]);
      setActiveSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  // ============ SERVICE SELECTION HELPERS ============
  const isServiceCoveredBySubscription = (serviceId) => {
    if (!activeSubscriptions || activeSubscriptions.length === 0) return false;

    return activeSubscriptions.some(subscription =>
      subscription.includedServices?.some(svc => svc.serviceId === serviceId)
    );
  };

  const toggleServiceSelection = (serviceId) => {
    setSelectedServiceIds(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  useEffect(() => {
    calculateEstimatedCost();
  }, [selectedServiceIds, allServices, activeSubscriptions]);

  const calculateEstimatedCost = () => {
    let total = 0;
    selectedServiceIds.forEach(serviceId => {
      const service = allServices.find(s => s.serviceId === serviceId);
      if (service && !isServiceCoveredBySubscription(serviceId)) {
        total += service.estimatedPrice || 0;
      }
    });
    setEstimatedCost(total);
  };

  // ============ NAVIGATION BETWEEN STEPS ============
  const goToNextStep = () => {
    if (currentStep === 1 && !selectedVehicleId) {
      toast.error('Please select a vehicle');
      return;
    }
    if (currentStep === 2 && (!selectedServiceCenterId || !selectedTimeSlotId)) {
      toast.error('Please select service center and time slot');
      return;
    }
    if (currentStep === 3 && cartItems.length === 0) {
      toast.error('Please select at least one service');
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 5));
  };

  const goToPreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // ============ STEP 4: CREATE APPOINTMENT & PAYMENT INTENT ============
  const handleSubmitAppointment = async () => {
    try {
      setSubmitting(true);

      // Validation: Check required fields
      if (!user?.customerId) {
        toast.error('User information is missing. Please login again.');
        setSubmitting(false);
        return;
      }

      if (!selectedVehicleId) {
        toast.error('Please select a vehicle');
        setSubmitting(false);
        return;
      }

      if (!selectedServiceCenterId) {
        toast.error('Please select a service center');
        setSubmitting(false);
        return;
      }

      if (!selectedTimeSlotId) {
        toast.error('Please select a time slot');
        setSubmitting(false);
        return;
      }

      if (!cartItems || cartItems.length === 0) {
        toast.error('Please select at least one service or package');
        setSubmitting(false);
        return;
      }

      // Get active subscription ID if exists
      const activeSubscriptionId = activeSubscriptions.length > 0
        ? activeSubscriptions[0].subscriptionId
        : null;

      // Extract service IDs and package IDs from cart items
      const serviceIds = [];
      let packageId = null;

      cartItems.forEach(item => {
        if (item.isPackage) {
          // If it's a package, use packageId (only one package allowed)
          packageId = item.packageId;
        } else {
          // If it's a service, add to serviceIds array
          if (item.serviceId) {
            serviceIds.push(parseInt(item.serviceId));
          }
        }
      });

      // Ensure at least serviceIds or packageId is provided
      if (serviceIds.length === 0 && !packageId) {
        toast.error('Cart items are invalid. Please select services or package again.');
        setSubmitting(false);
        return;
      }

      console.log('✅ Validation passed!');
      console.log('🛒 Cart Items:', cartItems);
      console.log('📦 Extracted serviceIds:', serviceIds);
      console.log('📦 Extracted packageId:', packageId);

      const bookingData = {
        customerId: parseInt(user?.customerId),
        vehicleId: parseInt(selectedVehicleId),
        serviceCenterId: parseInt(selectedServiceCenterId),
        slotId: parseInt(selectedTimeSlotId),
        serviceIds: serviceIds,
        packageId: packageId,
        subscriptionId: activeSubscriptionId,
        promotionCode: '',
        customerNotes: notes || '',
        preferredTechnicianId: null,
        priority: 'Normal',
        source: 'Online'
      };

      console.log('📝 Creating appointment with data:', bookingData);
      const appointmentResponse = await appointmentService.createAppointment(bookingData);

      const appointmentResult = appointmentResponse.data?.data || appointmentResponse.data;
      const appointmentId = appointmentResult?.appointmentId || appointmentResult?.id;
      const appointmentCode = appointmentResult?.appointmentCode;
      const invoiceId = appointmentResult?.invoiceId;

      console.log('✅ Appointment created:', { appointmentId, appointmentCode, invoiceId });
      toast.success(`Appointment created! Code: ${appointmentCode}`);

      // Try to create payment intent
      console.log('💳 Checking if payment is required for appointment:', appointmentId);
      console.log('💳 Payment method:', paymentMethod);
      console.log('💳 Return URL:', `${window.location.origin}/payment/callback`);

      try {
        const paymentResponse = await paymentService.createPaymentForAppointment(appointmentId, {
          paymentMethod: paymentMethod,
          returnUrl: `${window.location.origin}/payment/callback`
        });

        const paymentResult = paymentResponse.data?.data || paymentResponse.data;
        console.log('✅ Payment intent created:', paymentResult);

        // Save appointment and payment data
        setAppointmentData({
          appointmentId,
          appointmentCode,
          invoiceId: paymentResult?.invoiceId || invoiceId,
          invoiceCode: paymentResult?.invoiceCode,
          paymentIntentId: paymentResult?.paymentIntentId,
          paymentId: paymentResult?.paymentId,
          paymentCode: paymentResult?.paymentCode,
          paymentUrl: paymentResult?.paymentUrl,
          amount: paymentResult?.amount || estimatedCost
        });

        // Move to payment step
        setCurrentStep(5);
        toast.info('Please complete payment to confirm your appointment');

      } catch (paymentError) {
        // Check if error is "no payment required" (free appointment)
        const errorMessage = paymentError.response?.data?.error || paymentError.response?.data?.message || '';
        const isFreeAppointment = errorMessage.toLowerCase().includes('no payment required')
          || errorMessage.toLowerCase().includes('appointment is free')
          || errorMessage.toLowerCase().includes('subscription services');

        if (isFreeAppointment) {
          console.log('✅ Appointment is FREE (covered by subscription), no payment needed');
          toast.success('🎉 Appointment confirmed! (Covered by your subscription)');

          // Clear cart and booking state
          clearBookingState();

          // Redirect to my appointments after 2 seconds
          setTimeout(() => {
            navigate('/my-appointments');
          }, 2000);
        } else {
          // Other payment errors - rethrow to be caught by outer catch block
          throw paymentError;
        }
      }

    } catch (error) {
      console.error('❌ ========== ERROR CREATING APPOINTMENT ==========');
      console.error('❌ Error object:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error data:', error.response?.data);
      console.error('❌ Error message:', error.response?.data?.message);
      console.error('❌ Error details:', error.response?.data?.errors);
      console.error('❌ Status code:', error.response?.status);

      // Show detailed error to user
      const errorMessage = error.response?.data?.message
        || error.response?.data?.title
        || error.message
        || 'Unable to create appointment. Please try again.';

      const errorDetails = error.response?.data?.errors
        ? '\n' + JSON.stringify(error.response.data.errors, null, 2)
        : '';

      toast.error(errorMessage + errorDetails);
    } finally {
      setSubmitting(false);
    }
  };

  // ============ STEP 5: PAYMENT HANDLING ============
  const handleMockPayment = async () => {
    if (!appointmentData?.paymentCode) {
      toast.error('Payment information is missing');
      return;
    }

    try {
      setPaymentProcessing(true);
      console.log('💰 Processing mock payment for:', appointmentData.paymentCode);

      // Call mock payment complete
      await paymentService.mockCompletePayment(
        appointmentData.paymentCode,
        paymentMethod,
        true,
        appointmentData.amount
      );

      toast.success('Payment completed successfully!');

      // Verify payment status
      console.log('🔍 Verifying payment status...');
      const paymentStatusResponse = await paymentService.getPaymentByCode(appointmentData.paymentCode);
      const paymentStatus = paymentStatusResponse.data?.data || paymentStatusResponse.data;

      console.log('✅ Payment status:', paymentStatus);

      if (paymentStatus?.status?.toLowerCase() === 'completed') {
        toast.success('🎉 Appointment confirmed! Redirecting to your appointments...');

        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/my-appointments');
        }, 2000);
      } else {
        toast.warning('Payment status is pending. Please check your appointments.');
        setTimeout(() => {
          navigate('/my-appointments');
        }, 2000);
      }

    } catch (error) {
      console.error('❌ Payment error:', error);
      toast.error(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleRealPayment = () => {
    if (!appointmentData?.paymentUrl) {
      toast.error('Payment URL is not available. The payment gateway may not be configured.');
      console.error('❌ Payment URL missing:', appointmentData);
      return;
    }

    // For real payment, redirect to VNPay gateway
    console.log('🔗 Redirecting to VNPay gateway:', appointmentData.paymentUrl);
    toast.info('Redirecting to payment gateway...');

    // Small delay to show toast
    setTimeout(() => {
      window.location.href = appointmentData.paymentUrl;
    }, 500);
  };

  // ============ RENDER HELPERS ============
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const selectedVehicle = vehicles.find(v => v.vehicleId === parseInt(selectedVehicleId));
  const selectedServiceCenter = serviceCenters.find(sc => sc.serviceCenterId === parseInt(selectedServiceCenterId));
  const selectedTimeSlot = availableTimeSlots.find(ts => ts.timeSlotId === parseInt(selectedTimeSlotId));

  // ============ RENDER ============
  return (
      <div className="schedule-service-page">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-10 col-xl-9">
              <div className="schedule-card">
                {/* Header with Steps */}
                <div className="schedule-header">
                  <h2 className="schedule-title">
                    <i className="bi me-2"></i>
                    Schedule Service Appointment
                  </h2>
                  <div className="steps-indicator">
                    {[1, 2, 3, 4, 5].map(step => (
                      <div
                        key={step}
                        className={`step ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
                      >
                        <div className="step-number">{step}</div>
                        <div className="step-label">
                          {step === 1 && 'Vehicle'}
                          {step === 2 && 'Time & Place'}
                          {step === 3 && 'Services'}
                          {step === 4 && 'Confirm'}
                          {step === 5 && 'Payment'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {loading && currentStep !== 3 ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-light" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* STEP 1: SELECT VEHICLE */}
                    {currentStep === 1 && (
                      <div className="step-content">
                        <h4 className="mb-4">Select Your Vehicle</h4>
                        {vehicles.length === 0 ? (
                          <div className="d-flex justify-content-center">
                            <div className="alert alert-warning" style={{ display: 'inline-block', width: 'auto' }}>
                              You don't have any registered vehicles.
                              <a href="/register-vehicle" className="alert-link ms-2">Register one now</a>
                            </div>
                          </div>
                        ) : (
                          <div className="vehicle-grid">
                            {vehicles.map(vehicle => (
                              <div
                                key={vehicle.vehicleId}
                                className={`vehicle-card ${selectedVehicleId === vehicle.vehicleId ? 'selected' : ''}`}
                                onClick={() => setSelectedVehicleId(vehicle.vehicleId)}
                              >
                                <i className="bi bi-car-front vehicle-icon"></i>
                                <div className="vehicle-info">
                                  <h5>{vehicle.fullModelName || vehicle.modelName}</h5>
                                  <p className="mb-0">{vehicle.licensePlate}</p>
                                  {vehicle.year && <small className="text-muted">Year: {vehicle.year}</small>}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* STEP 2: SELECT TIME & PLACE */}
                    {currentStep === 2 && (
                      <div className="step-content">
                        <h4 className="mb-4">Choose Time & Location</h4>

                        {/* Service Center Selection */}
                        <div className="form-group mb-4">
                          <label className="form-label fw-bold">
                            <i className="bi bi-geo-alt me-2"></i>
                            Service Center
                          </label>
                          <select
                            className="form-select form-select-lg"
                            value={selectedServiceCenterId}
                            onChange={(e) => {
                              const selectedId = e.target.value;
                              console.log('🏢 Service Center Selected:', selectedId);
                              console.log('🏢 Type:', typeof selectedId);
                              setSelectedServiceCenterId(selectedId);
                            }}
                          >
                            <option value="">-- Select Service Center --</option>
                            {serviceCenters.map(center => {
                              // Try multiple possible ID field names
                              const centerId = center.serviceCenterId || center.id || center.centerId;
                              console.log('🏢 Rendering option:', { center, centerId });
                              return (
                                <option key={centerId} value={centerId}>
                                  {center.name} - {center.address}
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        {/* Date Selection */}
                        <div className="form-group mb-4">
                          <label className="form-label fw-bold">
                            <i className="bi bi-calendar3 me-2"></i>
                            Select Date
                          </label>
                          <input
                            type="date"
                            className="form-control form-control-lg"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            onClick={(e) => {
                              try {
                                if (e.target.showPicker) {
                                  e.target.showPicker();
                                }
                              } catch (error) {
                                // Fallback: If showPicker fails, do nothing (browser will handle normally)
                                console.log('showPicker not available or failed:', error.message);
                              }
                            }}
                            min={getTomorrowDate()}
                          />
                        </div>

                        {/* Time Slot Selection */}
                        {selectedServiceCenterId && selectedDate && (
                          <div className="form-group mb-4">
                            <label className="form-label fw-bold">
                              <i className="bi bi-clock me-2"></i>
                              Available Time Slots
                            </label>
                            {loading ? (
                              <div className="text-center py-3">
                                <div className="spinner-border spinner-border-sm text-light"></div>
                              </div>
                            ) : availableTimeSlots.length === 0 ? (
                              <div className="d-flex justify-content-center">
                                <div className="alert alert-info" style={{ display: 'inline-block', width: 'auto' }}>
                                  No available time slots for this date. Please select another date.
                                </div>
                              </div>
                            ) : (
                              <div className="time-slots-grid">
                                {availableTimeSlots.map((slot, index) => {
                                  const slotId = slot.timeSlotId || slot.slotId || slot.id;
                                  const isSelected = selectedTimeSlotId === slotId;

                                  console.log(`🕐 Rendering slot ${index}:`, {
                                    timeSlotId: slot.timeSlotId,
                                    slotId: slot.slotId,
                                    id: slot.id,
                                    finalId: slotId,
                                    isSelected,
                                    currentSelected: selectedTimeSlotId
                                  });

                                  return (
                                    <div
                                      key={slotId || index}
                                      className={`time-slot ${isSelected ? 'selected' : ''}`}
                                      onClick={() => {
                                        console.log('🕐 Clicked slot:', { slotId, slot });
                                        // Toggle: if clicking the same slot, deselect it
                                        if (selectedTimeSlotId === slotId) {
                                          console.log('🕐 Deselecting time slot:', slotId);
                                          setSelectedTimeSlotId('');
                                        } else {
                                          console.log('🕐 Selecting time slot:', slotId);
                                          setSelectedTimeSlotId(slotId);
                                        }
                                      }}
                                    >
                                      <i className="bi bi-clock"></i>
                                      <span>{slot.startTime} - {slot.endTime}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* STEP 3: SELECT SERVICES */}
                    {currentStep === 3 && (
                      <div className="step-content">
                        <h4 className="mb-4">Select Services</h4>

                        {/* Cart Items Display */}
                        {cartItems.length === 0 ? (
                          <div className="no-services-selected">
                            <div className="empty-state">
                              <i className="bi bi-cart-x"></i>
                              <h5>No services selected yet</h5>
                              <p>Click the button below to browse and select services for your appointment</p>
                            </div>

                            <button
                              className="btn-select-services"
                              onClick={() => {
                                // Save current booking state before navigating
                                saveBookingState({
                                  currentStep: 3,
                                  selectedVehicleId,
                                  selectedServiceCenterId,
                                  selectedDate,
                                  selectedTimeSlotId,
                                  notes
                                });
                                navigate('/products/individual');
                              }}
                            >
                              <i className="bi bi-plus-circle"></i> Select Services
                            </button>
                          </div>
                        ) : (
                          <div className="selected-services-display">
                            <div className="services-header">
                              <h6><i className="bi bi-check2-circle"></i> Selected Services ({cartItems.length})</h6>
                              <button
                                className="btn-add-more"
                                onClick={() => {
                                  // Save current booking state before navigating
                                  saveBookingState({
                                    currentStep: 3,
                                    selectedVehicleId,
                                    selectedServiceCenterId,
                                    selectedDate,
                                    selectedTimeSlotId,
                                    notes
                                  });
                                  navigate('/products/individual');
                                }}
                              >
                                <i className="bi bi-plus"></i> Add More
                              </button>
                            </div>

                            <div className="cart-items-list">
                              {cartItems.map((item, index) => {
                                const isPackage = item.isPackage;
                                const itemName = isPackage ? item.packageName : item.serviceName;
                                const itemPrice = isPackage
                                  ? (item.totalPriceAfterDiscount || item.basePrice || 0)
                                  : (item.basePrice || 0);

                                return (
                                  <div key={index} className="cart-item-preview">
                                    <div className="item-info">
                                      <div className="item-name">
                                        {itemName}
                                        {isPackage && <span className="package-badge">Package</span>}
                                      </div>
                                      <div className="item-quantity">Qty: {item.quantity}</div>
                                    </div>
                                    <div className="item-price">
                                      {new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND'
                                      }).format(itemPrice * item.quantity)}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            <div className="total-preview">
                              <span>Total:</span>
                              <span className="total-amount">
                                {new Intl.NumberFormat('vi-VN', {
                                  style: 'currency',
                                  currency: 'VND'
                                }).format(
                                  cartItems.reduce((total, item) => {
                                    const price = item.isPackage
                                      ? (item.totalPriceAfterDiscount || item.basePrice || 0)
                                      : (item.basePrice || 0);
                                    return total + (price * item.quantity);
                                  }, 0)
                                )}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        <div className="form-group mt-4">
                          <label className="form-label fw-bold">
                            <i className="bi bi-chat-left-text me-2"></i>
                            Additional Notes (Optional)
                          </label>
                          <textarea
                            className="form-control form-control-lg"
                            rows="3"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any specific concerns or requests..."
                          ></textarea>
                        </div>
                      </div>
                    )}

                    {/* STEP 4: CONFIRMATION SUMMARY */}
                    {currentStep === 4 && (
                      <div className="step-content">
                        <h4 className="mb-4">Confirm Your Appointment</h4>

                        <div className="summary-card">
                          <div className="summary-section">
                            <h6><i className="bi bi-car-front me-2"></i>Vehicle</h6>
                            <p>{selectedVehicle?.fullModelName || selectedVehicle?.modelName}</p>
                            <p className="text-muted">{selectedVehicle?.licensePlate}</p>
                          </div>

                          <div className="summary-section">
                            <h6><i className="bi bi-geo-alt me-2"></i>Service Center</h6>
                            <p>{selectedServiceCenter?.name}</p>
                            <p className="text-muted">{selectedServiceCenter?.address}</p>
                          </div>

                          <div className="summary-section">
                            <h6><i className="bi bi-calendar-check me-2"></i>Appointment Time</h6>
                            <p>{formatDateForDisplay(selectedDate)}</p>
                            <p className="text-muted">{selectedTimeSlot?.startTime} - {selectedTimeSlot?.endTime}</p>
                          </div>

                          <div className="summary-section">
                            <h6><i className="bi bi-tools me-2"></i>Selected Services</h6>
                            <ul className="services-summary-list">
                              {cartItems.map((item, index) => {
                                const isPackage = item.isPackage;
                                const itemName = isPackage ? item.packageName : item.serviceName;
                                const itemPrice = isPackage
                                  ? (item.totalPriceAfterDiscount || item.basePrice || 0)
                                  : (item.basePrice || 0);

                                return (
                                  <li key={index}>
                                    {itemName} {item.quantity > 1 && `(x${item.quantity})`}
                                    {isPackage && <span className="badge bg-info ms-2">Package</span>}
                                    <span className="ms-2">
                                      {new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND'
                                      }).format(itemPrice * item.quantity)}
                                    </span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>

                          {notes && (
                            <div className="summary-section">
                              <h6><i className="bi bi-chat-left-text me-2"></i>Notes</h6>
                              <p>{notes}</p>
                            </div>
                          )}

                          <div className="summary-section total-section">
                            <h5>Estimated Total</h5>
                            <h3 className="text-success">
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                              }).format(
                                cartItems.reduce((total, item) => {
                                  const price = item.isPackage
                                    ? (item.totalPriceAfterDiscount || item.basePrice || 0)
                                    : (item.basePrice || 0);
                                  return total + (price * item.quantity);
                                }, 0)
                              )}
                            </h3>
                            {activeSubscriptions.length > 0 && (
                              <small className="text-muted">* Some services may be covered by your VIP package</small>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 5: PAYMENT */}
                    {currentStep === 5 && appointmentData && (
                      <div className="step-content">
                        <div className="text-center mb-4">
                          <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3rem' }}></i>
                          <h4 className="mt-3 mb-2">Appointment Created Successfully!</h4>
                          <p className="text-muted">Appointment Code: <strong>{appointmentData.appointmentCode}</strong></p>
                          <p className="text-muted">Please complete payment to confirm your booking</p>
                        </div>

                        <div className="payment-card">
                          {/* Payment Summary */}
                          <div className="payment-summary mb-4">
                            <h6 className="mb-3"><i className="bi bi-receipt me-2"></i>Payment Summary</h6>
                            <div className="d-flex justify-content-between mb-2">
                              <span>Invoice Code:</span>
                              <strong>{appointmentData.invoiceCode}</strong>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                              <span>Payment Code:</span>
                              <strong>{appointmentData.paymentCode}</strong>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between align-items-center">
                              <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>Total Amount:</span>
                              <h4 className="text-success mb-0">
                                {new Intl.NumberFormat('vi-VN', {
                                  style: 'currency',
                                  currency: 'VND'
                                }).format(appointmentData.amount)}
                              </h4>
                            </div>
                          </div>

                          {/* Payment Method Selection */}
                          <div className="payment-methods-selection mb-4">
                            <h6 className="mb-3"><i className="bi bi-credit-card me-2"></i>Select Payment Method</h6>

                            <div className="payment-method-options">
                              <label className="payment-method-option">
                                <div className="payment-method-content">
                                  <img
                                    src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR-350x65.png"
                                    alt="VNPay"
                                  />
                                  <span>VNPay</span>
                                </div>
                                <input
                                  type="radio"
                                  name="paymentMethod"
                                  value="VNPay"
                                  checked={paymentMethod === 'VNPay'}
                                  onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                              </label>

                              <label className="payment-method-option">
                                <div className="payment-method-content">
                                  <img
                                    src="https://cdn.prod.website-files.com/64199d190fc7afa82666d89c/6491bee997eba92836f95d0c_momo_wallet.png"
                                    alt="Momo"
                                  />
                                  <span>Momo</span>
                                </div>
                                <input
                                  type="radio"
                                  name="paymentMethod"
                                  value="Momo"
                                  checked={paymentMethod === 'Momo'}
                                  onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                              </label>

                              <label className="payment-method-option">
                                <div className="payment-method-content">
                                  <svg fill="currentColor" viewBox="0 0 32 32" height={32} width={32} xmlns="http://www.w3.org/2000/svg">
                                    <path d="M32 13.333l-4.177 9.333h-1.292l1.552-3.266-2.75-6.068h1.359l1.99 4.651h0.026l1.927-4.651zM14.646 16.219v3.781h-1.313v-9.333h3.474c0.828-0.021 1.63 0.266 2.25 0.807 0.615 0.505 0.953 1.219 0.943 1.974 0.010 0.766-0.339 1.5-0.943 1.979-0.604 0.531-1.354 0.792-2.25 0.792zM14.641 11.818v3.255h2.198c0.484 0.016 0.958-0.161 1.297-0.479 0.339-0.302 0.526-0.714 0.526-1.141 0-0.432-0.188-0.844-0.526-1.141-0.349-0.333-0.818-0.51-1.297-0.495zM22.63 13.333c0.833 0 1.495 0.234 1.979 0.698s0.724 1.099 0.724 1.906v3.859h-1.083v-0.87h-0.047c-0.469 0.714-1.089 1.073-1.865 1.073-0.667 0-1.219-0.203-1.667-0.615-0.438-0.385-0.682-0.948-0.672-1.531 0-0.646 0.234-1.161 0.708-1.547 0.469-0.38 1.099-0.573 1.885-0.573 0.672 0 1.224 0.13 1.656 0.385v-0.271c0.005-0.396-0.167-0.776-0.464-1.042-0.297-0.276-0.688-0.432-1.094-0.427-0.63 0-1.13 0.276-1.5 0.828l-0.995-0.646c0.547-0.818 1.359-1.229 2.432-1.229zM21.167 17.88c-0.005 0.302 0.135 0.583 0.375 0.766 0.25 0.203 0.563 0.313 0.88 0.307 0.474 0 0.932-0.198 1.271-0.547 0.359-0.333 0.563-0.802 0.563-1.292-0.354-0.292-0.844-0.438-1.474-0.438-0.464 0-0.844 0.115-1.151 0.344-0.307 0.234-0.464 0.516-0.464 0.859zM5.443 10.667c1.344-0.016 2.646 0.479 3.641 1.391l-1.552 1.521c-0.568-0.526-1.318-0.813-2.089-0.797-1.385 0.005-2.609 0.891-3.057 2.198-0.229 0.661-0.229 1.38 0 2.042 0.448 1.307 1.672 2.193 3.057 2.198 0.734 0 1.365-0.182 1.854-0.505 0.568-0.375 0.964-0.958 1.083-1.625h-2.938v-2.052h5.13c0.063 0.359 0.094 0.719 0.094 1.083 0 1.625-0.594 3-1.62 3.927-0.901 0.813-2.135 1.286-3.604 1.286-2.047 0.010-3.922-1.125-4.865-2.938-0.771-1.505-0.771-3.286 0-4.792 0.943-1.813 2.818-2.948 4.859-2.938z" />
                                  </svg>
                                  <span>Google Pay</span>
                                </div>
                                <input
                                  type="radio"
                                  name="paymentMethod"
                                  value="GooglePay"
                                  checked={paymentMethod === 'GooglePay'}
                                  onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                              </label>
                            </div>
                          </div>

                          {/* Payment Actions */}
                          <div className="payment-actions">
                            <button
                              className="btn btn-lg btn-success"
                              onClick={handleRealPayment}
                              disabled={paymentProcessing || !appointmentData.paymentUrl}
                            >
                              {paymentProcessing ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2"></span>
                                  Processing Payment...
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-credit-card me-2"></i>
                                  Proceed to Payment
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="form-actions d-flex justify-content-center gap-3 mt-4">
                      {currentStep > 1 && currentStep < 5 && (
                        <button
                          type="button"
                          className="btn btn-outline-light"
                          onClick={goToPreviousStep}
                          disabled={submitting}
                        >
                          <i className="bi bi-arrow-left me-2"></i>
                          Previous
                        </button>
                      )}

                      {currentStep < 4 ? (
                        <button
                          type="button"
                          className="btn btn-light"
                          onClick={goToNextStep}
                          disabled={loading}
                        >
                          Next
                          <i className="bi bi-arrow-right ms-2"></i>
                        </button>
                      ) : currentStep === 4 ? (
                        <button
                          type="button"
                          className="btn btn-success"
                          onClick={handleSubmitAppointment}
                          disabled={submitting}
                        >
                          {submitting ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Creating Appointment...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-arrow-right me-2"></i>
                              Proceed to Payment
                            </>
                          )}
                        </button>
                      ) : null}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default ScheduleServiceNew;
