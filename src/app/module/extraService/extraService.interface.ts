export interface ICreateExtraService {
  serviceName: string;
  serviceAmount: number;
  isActive?: boolean;
}

export interface IUpdateExtraService {
  serviceName?: string;
  serviceAmount?: number;
  isActive?: boolean;
}