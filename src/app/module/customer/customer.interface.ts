export interface IUpdateCustomerInfoPayload {
  name?: string;
  profilePhoto?: string;
  contactNumber?: string;
  address?: string;
}

export interface IUpdateCustomerProfilePayload {
  customerInfo?: IUpdateCustomerInfoPayload;
}