import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { MapsService } from '../service/maps.service';
import { JwtAuthGuard } from '../security/jwt.guard';
import { DecodeInput, DirectionsInput, PlacesInput } from '../dto/input/map-dto.input';
import { DecodeOutput, DirectionsOutput, PlacesOutput } from '../dto/output/map-dto.output';

@Controller('/api/v1/maps')
export class MapsController {
	constructor(private mapsService: MapsService) {}

	@Post('/decode')
	@UseGuards(JwtAuthGuard)
	async decode(@Body() data: DecodeInput): Promise<DecodeOutput> {
		return this.mapsService.decode(data.location);
	}

	@Post('/direction')
	@UseGuards(JwtAuthGuard)
	async direction(@Body() data: DirectionsInput): Promise<DirectionsOutput> {
		return this.mapsService.getDirection(data.from, data.to);
	}

	@Post('/places')
	@UseGuards(JwtAuthGuard)
	async places(@Body() data: PlacesInput): Promise<PlacesOutput> {
		return this.mapsService.searchPlaces(data.toSearch);
	}
}
