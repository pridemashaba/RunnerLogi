import axios from 'axios';

export class GoogleMapsService {
  private apiKey: string;
  private baseUrl = 'https://maps.googleapis.com/maps/api';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async placeAutocomplete(
    input: string,
    sessionToken?: string,
    components?: string
  ): Promise<unknown> {
    try {
      const params: Record<string, string> = {
        input,
        key: this.apiKey,
        types: 'address',
      };

      if (sessionToken) {
        params.sessiontoken = sessionToken;
      }

      if (components) {
        params.components = components;
      }

      const response = await axios.get(`${this.baseUrl}/place/autocomplete/json`, { params });
      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Google Places Autocomplete failed: ${message}`);
    }
  }

  async getPlaceDetails(
    placeId: string,
    fields?: string[],
    sessionToken?: string
  ): Promise<unknown> {
    try {
      const defaultFields = [
        'place_id',
        'name',
        'formatted_address',
        'geometry',
        'address_components',
        'utc_offset',
      ];
      const params: Record<string, string> = {
        place_id: placeId,
        key: this.apiKey,
        fields: (fields || defaultFields).join(','),
      };

      if (sessionToken) {
        params.sessiontoken = sessionToken;
      }

      const response = await axios.get(`${this.baseUrl}/place/details/json`, { params });
      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Google Place Details failed: ${message}`);
    }
  }

  async calculateDistance(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): Promise<unknown> {
    try {
      const response = await axios.get(`${this.baseUrl}/distancematrix/json`, {
        params: {
          origins: `${origin.lat},${origin.lng}`,
          destinations: `${destination.lat},${destination.lng}`,
          key: this.apiKey,
          units: 'metric',
        },
      });
      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Distance Matrix API failed: ${message}`);
    }
  }
}
