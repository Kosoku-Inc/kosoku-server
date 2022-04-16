export type Location = {
	latitude: number;
	longitude: number;
};

export type ExtendedLocation = Location & {
	readableLocation: string;
};
