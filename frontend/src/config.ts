export interface Configuration {
  appRegistration: {
    clientId: string;
    redirectUri: string;
  };
}

var request = new XMLHttpRequest();
request.open("GET", "/config.json", false); // `false` makes the request synchronous
request.send(null);

let configInternal: Configuration | undefined = undefined;
if (request.status === 200) {
  configInternal = JSON.parse(request.responseText);
} else {
  console.error("Cannot load config.json");
}

export const config = configInternal!;
