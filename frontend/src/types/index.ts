import atlas from "azure-maps-control";

export interface Place {
  id: string;
  position: atlas.data.Position;
  name: string;
  description?: string;
}
export interface UserState {
  name: string;
  token?: string;
}

export interface PlacesState {
  items: Place[];
}

