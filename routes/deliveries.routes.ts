import { Router, Request, Response } from 'express';
import { GoogleMapsService } from '../services/google-maps.service.ts';
import { PricingService } from '../services/pricing.service.ts';
import { DeliveryEstimateRequest, DeliveryEstimateResponse } from '../types/api.types.ts';

const router = Router();
const googleMapsService = new GoogleMapsService(process.env.GOOGLE_MAPS_API_KEY!);
const pricingService = new PricingService();

router.post('/estimate', async (req: Request, res: Response) => {
  try {
    const {
      pickup,
      dropoff,
      delivery_options,
      vehicle_type = 'car',
    }: DeliveryEstimateRequest = req.body;

    if (!pickup?.place_id || !pickup?.address || !pickup?.coordinates) {
      return res.status(400).json({
        error: 'Pickup place_id, address, and coordinates are required',
      });
    }

    if (!dropoff?.place_id || !dropoff?.address || !dropoff?.coordinates) {
      return res.status(400).json({
        error: 'Dropoff place_id, address, and coordinates are required',
      });
    }

    if (!delivery_options?.service_type) {
      return res.status(400).json({
        error: 'Delivery service type is required',
      });
    }

    const distanceData = await googleMapsService.calculateDistance(
      pickup.coordinates,
      dropoff.coordinates
    );
    const distanceResponse = distanceData as {
      status?: string;
      rows?: Array<{
        elements?: Array<{
          status?: string;
          distance?: { value: number; text: string };
          duration?: { value: number; text: string };
        }>;
      }>;
    };

    const element = distanceResponse.rows?.[0]?.elements?.[0];

    if (
      distanceResponse.status !== 'OK' ||
      element?.status !== 'OK' ||
      !element.distance ||
      !element.duration
    ) {
      throw new Error('Could not calculate route between locations');
    }

    const distanceMeters = element.distance.value;
    const durationSeconds = element.duration.value;

    const pricing = pricingService.calculatePrice(
      distanceMeters,
      durationSeconds,
      vehicle_type,
      delivery_options.service_type,
      {
        requires_signature: delivery_options.requires_signature,
        fragile: delivery_options.fragile,
      }
    );

    const now = Date.now();
    const response: DeliveryEstimateResponse = {
      pricing: {
        base_fare: pricing.base_fare,
        distance_fare: pricing.distance_fare,
        time_fare: pricing.time_fare,
        service_fee: pricing.service_fee,
        surge_multiplier: pricing.surge_multiplier,
        total: pricing.total,
        currency: pricing.currency,
      },
      distance: {
        value: distanceMeters,
        text: element.distance.text,
      },
      duration: {
        value: durationSeconds,
        text: element.duration.text,
      },
      estimated_pickup_time: new Date(now + 5 * 60 * 1000).toISOString(),
      estimated_delivery_time: new Date(now + (durationSeconds + 300) * 1000).toISOString(),
      breakdown: {
        per_km_rate: pricing.per_km_rate,
        per_minute_rate: pricing.per_minute_rate,
        minimum_fare: pricing.minimum_fare,
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Delivery estimate error:', error);
    res.status(500).json({ error: 'Failed to calculate delivery estimate' });
  }
});

export default router;
