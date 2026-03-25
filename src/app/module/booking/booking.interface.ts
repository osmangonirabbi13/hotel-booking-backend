export interface ICreateBookingPayload {
  customerId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  specialRequests?: string;
}
export interface IBookBookingPayload {
  roomId: string;
  checkIn: string | Date;
  checkOut: string | Date;
  guests: number;
  specialRequests?: string;
}