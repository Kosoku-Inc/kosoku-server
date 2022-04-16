import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { SocketUserInfo } from './types/rtc-events.types';
import { Location } from './types/location.types';

@Injectable()
export class GeoUtils {
	getDistance = (lat1: number, lon1: number, lat2: number, lon2: number, unit: string): number => {
		if (lat1 == lat2 && lon1 == lon2) {
			return 0;
		} else {
			const radlat1 = (Math.PI * lat1) / 180;
			const radlat2 = (Math.PI * lat2) / 180;
			const theta = lon1 - lon2;
			const radtheta = (Math.PI * theta) / 180;

			let dist =
				Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
			if (dist > 1) {
				dist = 1;
			}
			dist = Math.acos(dist);
			dist = (dist * 180) / Math.PI;
			dist = dist * 60 * 1.1515;
			if (unit == 'K') {
				dist = dist * 1.609344;
			}
			if (unit == 'N') {
				dist = dist * 0.8684;
			}
			return dist;
		}
	};

	toSortedList = (from: Location, unsorted: Map<number, SocketUserInfo>) => {
		const array = Array.from(unsorted, ([name, value]) => [name, value] as [number, SocketUserInfo]);

		return array.sort((a, b) => {
			return (
				this.getDistance(from.latitude, from.longitude, a[1].location.latitude, a[1].location.longitude, 'K') -
				this.getDistance(from.latitude, from.longitude, b[1].location.latitude, b[1].location.longitude, 'K')
			);
		});
	};
}
