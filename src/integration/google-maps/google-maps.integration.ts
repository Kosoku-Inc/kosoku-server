import { Injectable } from '@nestjs/common';
import { Client } from '@googlemaps/google-maps-services-js';
import axios from 'axios';

@Injectable()
export class GoogleMaps {
	readonly mapsKey = process.env.DIRECTIONS_GATEWAY_API_KEY || '';
	readonly client = new Client({ axiosInstance: axios.create() });
}
