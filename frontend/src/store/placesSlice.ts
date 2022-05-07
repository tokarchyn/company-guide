import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Place, PlacesState } from "types";

const initState: PlacesState = {
  items: [
    {
      id: "1",
      position: [-100.01, 45.01],
      name: "test1",
      description:
        "Very long description Very long description Very long description Very long description Very long description Very long description",
    },
    {
      id: "2",
      position: [-120.2, 45.1],
      name: "test2",
    },
    { id: "3", position: [-120.2, 50.1], name: "test3" },
  ],
};

const placesSlice = createSlice({
  name: "places",
  initialState: initState,
  reducers: {
    setPlaceItems: (state, action: PayloadAction<Place[]>) => {
      state.items = action.payload;
    },
  },
});

export const { setPlaceItems } = placesSlice.actions;

export const placesReducer = placesSlice.reducer;
