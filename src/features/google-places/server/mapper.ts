export type GooglePlaceListDTO = {
  locations: GooglePlaceDTO[];
  nextPageToken?: string;
};

export type GooglePlaceDTO = {
  name: string; // e.g. "locations/1234567890"
  title?: string; // Business name
  storeCode?: string;
  locationName?: string; // Display name
  primaryPhone?: string;
  primaryCategory?: {
    displayName?: string;
  };
  address?: {
    regionCode?: string;
    administrativeArea?: string;
    locality?: string;
    postalCode?: string;
    addressLines?: string[];
  };
  websiteUri?: string;
  metadata?: {
    placeId?: string;
    mapsUrl?: string;
  };
};
export type { GooglePlaceDTO as GooglePlaceListItem };