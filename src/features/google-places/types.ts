export type GooglePlaceRow = {
  id: string;
  name: string;
  address: string;
  locationName: string;
  googlePlaceId: string;
  isLinked: boolean;
};

export type GooglePlacesApiLocation = {
  name?: string;
  title?: string;
  locationName?: string;
  storeCode?: string;
  address?: {
    postalAddress?: {
      addressLines?: string[];
      locality?: string;
      administrativeArea?: string;
      postalCode?: string;
      regionCode?: string;
    };
  };
  metadata?: {
    linkedPlaceId?: string;
    [key: string]: unknown;
  };
};

export type GooglePlacesApiResponse = {
  locations?: GooglePlacesApiLocation[];
  nextPageToken?: string;
  totalSize?: number;
};

const formatAddress = (address?: GooglePlacesApiLocation["address"]): string => {
  const postal = address?.postalAddress;
  if (!postal) {
    return "—";
  }

  const components = [
    ...(postal.addressLines ?? []),
    postal.locality,
    postal.administrativeArea,
    postal.postalCode,
    postal.regionCode,
  ].filter(Boolean) as string[];

  return components.join(", ") || "—";
};

const buildRowName = (location: GooglePlacesApiLocation): string => {
  return (
    location.title ??
    location.locationName ??
    location.storeCode ??
    location.name ??
    "Unnamed location"
  );
};

export function mapGoogleLocationToRow(
  location: GooglePlacesApiLocation,
  linkedPlaceIds: Set<string>
): GooglePlaceRow {
  const name = buildRowName(location);
  const googlePlaceId =
    location.name ??
    location.metadata?.linkedPlaceId ??
    location.storeCode ??
    location.locationName ??
    location.title ??
    name;
  const locationName = location.locationName ?? name;
  const id = googlePlaceId || locationName;
  return {
    id,
    name,
    address: formatAddress(location.address),
    locationName,
    googlePlaceId,
    isLinked: googlePlaceId ? linkedPlaceIds.has(googlePlaceId) : false,
  };
}
