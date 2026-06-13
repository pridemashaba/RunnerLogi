export type DeliveryServiceType = 'express' | 'standard' | 'scheduled';
export type VehicleType = 'bike' | 'car' | 'van' | 'truck';

export interface LocationSearchRequest {
  input: string;
  sessionToken?: string;
  components?: string;
}

export interface LocationSearchResponse {
  predictions: Prediction[];
  status: string;
}

export interface Prediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  terms: Term[];
}

export interface Term {
  value: string;
  offset: number;
}

export interface LocationDetailsRequest {
  place_id: string;
  fields?: string[];
  sessionToken?: string;
}

export interface LocationDetailsResponse {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  address_components?: AddressComponent[];
  utc_offset?: number;
}

export interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

export interface DeliveryEstimateRequest {
  pickup: {
    place_id: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  dropoff: {
    place_id: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  delivery_options: {
    service_type: DeliveryServiceType;
    scheduled_time?: string;
    requires_signature?: boolean;
    fragile?: boolean;
  };
  vehicle_type?: VehicleType;
}

export interface DeliveryEstimateResponse {
  pricing: {
    base_fare: number;
    distance_fare: number;
    time_fare: number;
    service_fee: number;
    surge_multiplier: number;
    total: number;
    currency: string;
  };
  distance: {
    value: number;
    text: string;
  };
  duration: {
    value: number;
    text: string;
  };
  estimated_pickup_time?: string;
  estimated_delivery_time?: string;
  breakdown: {
    per_km_rate: number;
    per_minute_rate: number;
    minimum_fare: number;
  };
}
