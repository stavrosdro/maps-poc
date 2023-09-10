import { AddressForm, Option } from "./useMapsStore";

export type QueryResponse = {
  predictions: Prediction[];
};

type Prediction = {
  description: string;
  place_id: string;
};

export type LocationResponse = {
  result: LocationResponseResult;
};

type LocationResponseResult = {
  address_components?: AddressComponent[];
  geometry: Geometry;
};

type AddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

type Geometry = {
  location: {
    lat: number;
    lng: number;
  };
};

enum ADDRESS_TYPE {
  ROUTE = "route",
  STREET_NUMBER = "street_number",
  CITY = "locality",
  STATE = "administrative_area_level_3",
  POSTAL_CODE = "postal_code",
}

export function queryResponseMapper(response: QueryResponse): Option[] {
  return response.predictions.map((prediction) => ({
    name: prediction.description,
    value: prediction.place_id,
  }));
}

export function locationResponseMapper(
  response: LocationResponse
): AddressForm {
  const latLng = mapLatLng(response);
  const addressForm: AddressForm = {
    streetAddress: mapStreetAddress(response),
    state: mapState(response),
    city: mapCity(response),
    postcode: mapPostcode(response),
    floor: "",
    long: latLng.long,
    lang: latLng.lang,
  };

  return addressForm;
}

function mapStreetAddress(response: LocationResponse): string {
  const streetName = response.result.address_components?.find((item) =>
    item.types.includes(ADDRESS_TYPE.ROUTE)
  );
  const streetNumber = response.result.address_components?.find((item) =>
    item.types.includes(ADDRESS_TYPE.STREET_NUMBER)
  );

  if (!streetName || !streetNumber) {
    return "";
  }

  return `${streetName.long_name} ${streetNumber.long_name}`;
}

function mapState(response: LocationResponse): string {
  const state = response.result.address_components?.find((item) =>
    item.types.includes(ADDRESS_TYPE.STATE)
  );

  if (!state) {
    return "";
  }

  return state.long_name;
}

function mapCity(response: LocationResponse): string {
  const city = response.result.address_components?.find((item) =>
    item.types.includes(ADDRESS_TYPE.CITY)
  );

  if (!city) {
    return "";
  }

  return city.long_name;
}

function mapPostcode(response: LocationResponse): string {
  const postcode = response.result.address_components?.find((item) =>
    item.types.includes(ADDRESS_TYPE.POSTAL_CODE)
  );

  if (!postcode) {
    return "";
  }

  return postcode.long_name;
}

function mapLatLng(response: LocationResponse): { lang: string; long: string } {
  return {
    long: "" + response.result.geometry?.location.lng,
    lang: "" + response.result.geometry?.location.lat,
  };
}

export function isFormEmpty(form: AddressForm) {
  if (!form.streetAddress || form.streetAddress.length < 4) {
    return true
  }
}