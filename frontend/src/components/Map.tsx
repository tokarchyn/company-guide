import styled from "@emotion/styled";
import * as atlas from "azure-maps-control";
import "azure-maps-control/dist/atlas.min.css";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { msalInstance } from "services/authentication";
import { useAppSelector } from "store/store";
import { Place } from "types";
import { PlacePopup } from "./PlacePopup";

const MapContainer = styled.div`
  flex-grow: 1;
`;

const memoizedOptions: atlas.SymbolLayerOptions = {
  textOptions: {
    textField: ["get", "title"], //Specify the property name that contains the text you want to appear with the symbol.
    offset: [0, 1.2],
  },
};

export const AzureMap: React.FC = () => {
  const places = useAppSelector((state) => state.places.items);

  const [layerOptions, setLayerOptions] =
    useState<atlas.SymbolLayerOptions>(memoizedOptions);

  const mapFeatures = useMemo(
    (): any =>
      places.map(
        (p) => new atlas.data.Feature(new atlas.data.Point(p.position), p)
      ),
    [places]
  );

  return (
    <MapContainer>
      <MapCanvas features={mapFeatures} />
    </MapContainer>
  );
};

const MapCanvas = memo<{
  features?: atlas.data.Feature<atlas.data.Point, any>[];
}>(({ features }) => {
  const [mapId] = useState(Math.random().toString());
  const [isReady, setIsReady] = useState(false);
  const [mapInstance, setMapInstance] = useState<atlas.Map>();
  const [dataSource, setDataSource] = useState<atlas.source.DataSource>();
  const [symbolLayer, setSymbolLayer] = useState<atlas.layer.SymbolLayer>();
  const [popup] = useState(
    new atlas.Popup({
      pixelOffset: [0, -18],
      closeButton: false,
    })
  );

  useEffect(() => {
    if (isReady && mapInstance && dataSource) {
      dataSource.clear();

      features?.forEach((f) => {
        dataSource.add(f);
      });
    }
  }, [isReady, features, mapInstance, dataSource]);

  useEffect(() => {
    setIsReady(false);
    setMapInstance(
      (current) =>
        new atlas.Map(mapId, {
          authOptions: {
            authType: atlas.AuthenticationType.anonymous,
            clientId: "3886d8bc-310f-4183-a853-7dc881a658e9", // azure map account client id
            getToken: async (resolve, reject) => {
              try {
                const result = await msalInstance.acquireTokenSilent({
                  scopes: ["https://atlas.microsoft.com/user_impersonation"],
                  account: msalInstance.getActiveAccount() ?? undefined,
                });
                resolve(result.accessToken);
              } catch (err) {
                reject(err);
              }
            },
          },
          center: [-100.01, 45.01],
          zoom: 2,
          view: "Auto",
          showLogo: false,
          showFeedbackLink: false,
          style: "satellite_road_labels",
        })
    );
  }, [mapId]);

  useEffect(() => {
    if (mapInstance) {
      const callback = () => {
        var dataSource = new atlas.source.DataSource();
        mapInstance.sources.add(dataSource);
        var layer = new atlas.layer.SymbolLayer(dataSource);
        mapInstance.layers.add(layer);

        setSymbolLayer(layer);
        setDataSource(dataSource);
        setIsReady(true);
      };
      mapInstance.events.add("ready", callback);

      return () => mapInstance.events.remove("ready", callback);
    }
  }, [mapInstance]);

  const openPopup = useCallback(
    (place: Place, coordinate: atlas.data.Position) => {
      popup.setOptions({
        content: renderToStaticMarkup(<PlacePopup place={place} />),
        position: coordinate,
      });

      popup.open(mapInstance);
    },
    [popup, mapInstance]
  );

  const closePopup = useCallback(() => popup.close(), [popup]);

  useEffect(() => {
    if (isReady && mapInstance && symbolLayer) {
      const callback = (e: atlas.MapMouseEvent) => {
        if (e.shapes && e.shapes.length > 0) {
          const shape = e.shapes[0];
          if (shape instanceof atlas.Shape) {
            const properties = shape.getProperties();
            const coordinate = shape.getCoordinates();
            openPopup(properties, coordinate as atlas.data.Position);
          }
        }
      };
      mapInstance.events.add("mouseover", symbolLayer, callback);

      return () =>
        mapInstance.events.remove(
          "mouseover",
          symbolLayer,
          callback as (
            e:
              | void
              | atlas.MapMouseEvent
              | atlas.MapTouchEvent
              | atlas.MapMouseWheelEvent
              | atlas.layer.Layer
          ) => void
        );
    }
  }, [isReady, mapInstance, symbolLayer, openPopup]);

  useEffect(() => {
    if (mapInstance && symbolLayer) {
      mapInstance.events.add("mouseleave", symbolLayer, closePopup);

      return () =>
        mapInstance.events.remove("mouseleave", symbolLayer, closePopup);
    }
  }, [mapInstance, symbolLayer, closePopup]);

  return <div id={mapId} style={{ height: "100%" }}></div>;
});
