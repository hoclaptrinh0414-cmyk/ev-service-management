export interface CustomerTypeResponseDto {
  typeId: number;
  typeName: string;
  discountPercent: number;
  description?: string | null;
  isActive: boolean;
  customerCount: number;
  activeCustomerCount: number;
  totalRevenueFromType: number;
}

export interface CustomerVehicleSummaryDto {
  vehicleId: number;
  licensePlate: string;
  modelName: string;
  brandName: string;
  isActive: boolean;
  isMaintenanceDue: boolean;
}

export interface CustomerResponseDto {
  customerId: number;
  customerCode: string;
  fullName: string;
  phoneNumber: string;
  email?: string | null;
  address?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  typeId?: number | null;
  preferredLanguage: string;
  marketingOptIn?: boolean | null;
  loyaltyPoints?: number | null;
  totalSpent?: number | null;
  lastVisitDate?: string | null;
  notes?: string | null;
  isActive?: boolean | null;
  createdDate?: string | null;
  customerType?: CustomerTypeResponseDto | null;
  age: number;
  displayName: string;
  contactInfo: string;
  loyaltyStatus: string;
  vehicleCount: number;
  activeVehicleCount: number;
  potentialDiscount: number;
  lastVisitStatus: string;
  recentVehicles: CustomerVehicleSummaryDto[];
}
