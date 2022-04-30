import { Injectable } from '@nestjs/common';
import { Client, LatLngLiteral, LatLngLiteralVerbose } from '@googlemaps/google-maps-services-js';
import axios from 'axios';
import {
	PlaceAutocompleteRequest,
	PlaceAutocompleteResponse,
} from '@googlemaps/google-maps-services-js/dist/places/autocomplete';
import { DirectionsRequest, DirectionsResponse } from '@googlemaps/google-maps-services-js/dist/directions';
import {
	ReverseGeocodeRequest,
	ReverseGeocodeResponse,
} from '@googlemaps/google-maps-services-js/dist/geocode/reversegeocode';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const GraphHopperRouting = require('graphhopper-js-api-client/src/GraphHopperRouting');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const GraphHopperGeocoding = require('graphhopper-js-api-client/src/GraphHopperGeocoding');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const GHInput = require('graphhopper-js-api-client/src/GHInput');

@Injectable()
export class GoogleMaps {
	readonly mapsKey = process.env.DIRECTIONS_GATEWAY_API_KEY || '';
	private readonly useGraphHopper =
		process.env.USE_GRAPHHOPPER?.toLowerCase() === 'true' || !process.env.MOCK_GEOCODING;
	readonly client: Client;

	constructor() {
		if (this.useGraphHopper) {
			const ghRouting = new GraphHopperRouting({
				key: this.mapsKey,
				vehicle: 'car',
				elevation: false,
			}) as {
				doRequest: () => Promise<{
					paths: Array<any>;
				}>;
				addPoint: (point: typeof GHInput) => void;
				clearPoints: () => void;
			};

			const ghGeocoding = new GraphHopperGeocoding({
				key: this.mapsKey,
			}) as {
				doRequest: ({
					locale,
					query,
					point,
				}: {
					locale: string;
					query?: string;
					point?: typeof GHInput;
				}) => Promise<{
					hits: Array<{
						street: string;
						housenumber: string;
						city: string;
						country: string;
						name?: string;
						point: LatLngLiteral;
					}>;
				}>;
			};

			this.client = {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				placeAutocomplete: async (request: PlaceAutocompleteRequest): Promise<PlaceAutocompleteResponse> => {
					const result = await ghGeocoding.doRequest({
						locale: 'ru',
						query: request.params.input,
					});

					return {
						data: {
							predictions: result.hits.map((hit) => ({
								description: hit.name ?? `${hit.street}, ${hit.housenumber}`,
								location: hit.point,
							})),
						},
					} as unknown as PlaceAutocompleteResponse;
				},
				directions: async (request: DirectionsRequest): Promise<DirectionsResponse> => {
					const from = request.params.origin as LatLngLiteralVerbose;
					const to = request.params.destination as LatLngLiteralVerbose;

					ghRouting.clearPoints();

					ghRouting.addPoint(new GHInput(from.latitude, from.longitude));
					ghRouting.addPoint(new GHInput(to.latitude, to.longitude));

					const result = await ghRouting.doRequest();

					return {
						data: {
							routes: result.paths.map((path) => ({
								overview_path: path.points.coordinates.map((arr: Array<number>) => ({
									lat: arr[1],
									lng: arr[0],
								})),
								legs: [
									{
										duration: {
											value: path.time / 1000,
										},
									},
								],
							})),
						},
					} as unknown as DirectionsResponse;
				},
				reverseGeocode: async (request: ReverseGeocodeRequest): Promise<ReverseGeocodeResponse> => {
					const position = request.params.latlng as LatLngLiteralVerbose;
					const result = await ghGeocoding.doRequest({
						locale: 'ru',
						point: new GHInput(position.latitude, position.longitude),
					});

					return {
						data: {
							results: result.hits.map((hit) => ({
								address_components: [
									{
										short_name:
											hit.street && hit.housenumber && `${hit.street}, ${hit.housenumber}`,
									},
								],
							})),
						},
					} as unknown as ReverseGeocodeResponse;
				},
			} as unknown as Client;
		} else {
			this.client = new Client({ axiosInstance: axios.create() });
		}
	}
}
