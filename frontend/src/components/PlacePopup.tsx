import { Place } from "types";

export function PlacePopup(props: { place: Place }) {
  return (
    <div
      style={{
        padding: "10px",
        width: "180px",
        whiteSpace: "normal",
        textOverflow: "ellipsis",
        pointerEvents: "none",
      }}
    >
      <div style={{ fontSize: "1.2em" }}>
        {props.place.name}
      </div>
    </div>
  );
}
