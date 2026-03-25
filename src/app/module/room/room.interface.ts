

export type ICreateRoomPayload = {
  rent: number;
  totalUnits: number;
  roomSize?: number;
  numberOfBaths: number;
  maxGuests: number;
  maxAdults?: number;
  maxChildren?: number;

  categoryId: string;
  bedTypeId: string;

  isEventSpace?: boolean;
  isFeatured?: boolean;
  isActive?: boolean;
  enableDynamicPricing?: boolean;

  featuredImage?: string;
  sliderImages?: string[];

  roomTitle?: string;
  featuredTitle?: string;
  description?: string;

  seoTitle?: string;
  seoDescription?: string;

  adminId?: string;
  amenityIds?: string[];
  extraServiceIds?: string[];
};




export type IUpdateRoomPayload = {
  rent?: number;
  totalUnits?: number;
  roomSize?: number;
  numberOfBaths?: number;
  maxGuests?: number;
  maxAdults?: number;
  maxChildren?: number;

  categoryId?: string;
  bedTypeId?: string;

  isEventSpace?: boolean;
  isFeatured?: boolean;
  isActive?: boolean;
  enableDynamicPricing?: boolean;

  featuredImage?: string;
  sliderImages?: string[];

  roomTitle?: string;
  featuredTitle?: string;
  description?: string;

  seoTitle?: string;
  seoDescription?: string;

  adminId?: string;
  amenityIds?: string[];
  extraServiceIds?: string[];

  removeFeaturedImage?: boolean;
  deletedSliderImages?: string[];
};