import { connect } from "worterbuch-js";

async function main() {
  const wb = await connect("tcp://localhost:8081");
  await wb.set("audio-widgets/eq/demo", {
    bypassed: false,
    bands: [
      {
        type: "HighPass",
        bypassed: false,
        frequency: 64,
        q: 100,
      },
      {
        type: "Bell",
        bypassed: false,
        frequency: 1000,
        gain: 3,
        q: 3,
      },
      {
        type: "Bell",
        bypassed: false,
        frequency: 3000,
        gain: -6,
        q: 50,
      },
      {
        type: "Bell",
        bypassed: false,
        frequency: 5000,
        gain: 4,
        q: 0.5,
      },
    ],
  });
  wb.close();
}

main();
