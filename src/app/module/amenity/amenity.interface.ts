
export interface ICreateAmenity {
  title: string;
  icon?: string;
  serialNumber: number;
}

export interface IUpdateAmenity {
  title?: string;
  icon?: string;
  serialNumber?: number;
}