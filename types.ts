
export interface FlyerRequest {
  description: string;
  images: string[]; // base64 strings
  additionalPhones?: string;
  logo?: string; // base64 string for the university logo
}

export interface GeneratedFlyer {
  imageUrl: string;
  timestamp: number;
}
