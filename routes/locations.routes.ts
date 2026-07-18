import { Router, Request, Response } from 'express';
import { GoogleMapsService } from '../services/google-maps.service.ts';
import {
  LocationDetailsRequest,
  LocationDetailsResponse,
  LocationSearchRequest,
} from '../types/api.types.ts';

const router = Router();
const googleMapsService = new GoogleMapsService(process.env.GOOGLE_MAPS_API_KEY!);

router.post('/search', async (req: Request, res: Response) => {
  try {
    const { input, sessionToken, components }: LocationSearchRequest = req.body;

    if (!input || input.trim().length < 2) {
      return res.status(400).json({
        error: 'Input must be at least 2 characters long',
      });
    }

    const data = await googleMapsService.placeAutocomplete(input, sessionToken, components);
    const response = data as {
      status?: string;
      predictions?: Array<{
        place_id?: string;
        description?: string;
        structured_formatting?: { main_text?: string; secondary_text?: string };
        terms?: Array<{ value?: string; offset?: number }>;
      }>;
    };

    if (response.status !== 'OK' && response.status !== 'ZERO_RESULTS') {
      throw new Error(`Google API error: ${response.status}`);
    }

    const predictions = response.predictions?.map(prediction => ({
      place_id: prediction.place_id || '',
      description: prediction.description || '',
      structured_formatting: {
        main_text: prediction.structured_formatting?.main_text || '',
        secondary_text: prediction.structured_formatting?.secondary_text || '',
      },
      terms: prediction.terms?.map(term => ({
        value: term.value || '',
        offset: term.offset || 0,
      })) || [],
    })) || [];

    res.json({
      predictions,
      status: response.status,
    });
  } catch (error) {
    console.error('Location search error:', error);
    res.status(500).json({ error: 'Failed to search locations' });
  }
});

router.post('/details', async (req: Request, res: Response) => {
  try {
    const { place_id, fields, sessionToken }: LocationDetailsRequest = req.body;

    if (!place_id) {
      return res.status(400).json({ error: 'place_id is required' });
    }

    const data = await googleMapsService.getPlaceDetails(place_id, fields, sessionToken);
    const response = data as {
      status?: string;
      result?: {
        place_id?: string;
        name?: string;
        formatted_address?: string;
        geometry?: LocationDetailsResponse['geometry'];
        address_components?: LocationDetailsResponse['address_components'];
        utc_offset?: number;
      };
    };

    if (response.status !== 'OK') {
      throw new Error(`Google API error: ${response.status}`);
    }

    const result = response.result;
    if (!result?.place_id || !result.geometry) {
      return res.status(500).json({ error: 'Invalid Google Place Details response' });
    }

    const locationResponse: LocationDetailsResponse = {
      place_id: result.place_id,
      name: result.name || '',
      formatted_address: result.formatted_address || '',
      geometry: result.geometry,
      address_components: result.address_components,
      utc_offset: result.utc_offset,
    };

    res.json(locationResponse);
  } catch (error) {
    console.error('Location details error:', error);
    res.status(500).json({ error: 'Failed to get location details' });
  }
});

export default router;
