import React from "react";
import ParametricEQ from "./ParametricEQ";
import { EqBandType, EqParameters, EqState } from "./types";

export default function App() {
  const [eqState, setEqState] = React.useState<EqState>({
    bypassed: false,
    bands: [
      {
        type: EqBandType.HighPass,
        bypassed: false,
        frequency: 64,
        q: 100,
      },
      {
        type: EqBandType.Bell,
        bypassed: false,
        frequency: 1000,
        gain: 3,
        q: 3,
      },
      {
        type: EqBandType.Bell,
        bypassed: false,
        frequency: 3000,
        gain: -6,
        q: 50,
      },
    ],
  });

  React.useEffect(() => {
    console.log(eqState);
  }, [eqState]);

  const params: EqParameters = {
    maxFrequency: 24000,
    minFrequency: 20,
    maxGain: 12,
    minGain: -12,
    maxQ: 100,
    minQ: 0.1,
  };

  return (
    <div
      id="main"
      style={{
        width: "50vw",
        height: "50vh",
        backgroundColor: "#333",
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        margin: "auto",
      }}
    >
      <ParametricEQ
        params={params}
        state={eqState}
        style={{ width: "100%", height: "100%" }}
        onChange={setEqState}
      />
    </div>
  );
}
