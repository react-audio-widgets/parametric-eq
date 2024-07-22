/**
 *  Copyright (C) 2024 Michael Bachmann
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import React from "react";
import ParametricEQ from "./ParametricEQ";
import { EqParameters, EqState } from "./types";
import { useSet, useSubscribe } from "worterbuch-react";

export default function App() {
  const setEqState = useSet("audio-widgets/eq/demo");
  const eqState = useSubscribe<EqState>("audio-widgets/eq/demo");

  const params: EqParameters = React.useMemo(
    () => ({
      maxFrequency: 24000,
      minFrequency: 20,
      maxGain: 12,
      minGain: -12,
      maxQ: 100,
      minQ: 0.1,
    }),
    []
  );

  return (
    <>
      <div
        id="main"
        style={{
          width: "50vw",
          height: "33vh",
          backgroundColor: "#333",
          position: "absolute",
          top: 0,
          bottom: "50vh",
          left: 0,
          right: 0,
          margin: "auto",
        }}
      >
        <ParametricEQ
          params={params}
          state={eqState || undefined}
          style={{ width: "100%", height: "100%" }}
          onChange={setEqState}
        />
      </div>
      <div
        id="main"
        style={{
          width: "50vw",
          height: "33vh",
          backgroundColor: "#333",
          position: "absolute",
          top: "50vh",
          bottom: 0,
          left: 0,
          right: 0,
          margin: "auto",
        }}
      >
        <ParametricEQ
          params={params}
          state={eqState || undefined}
          style={{ width: "100%", height: "100%" }}
          onChange={setEqState}
        />
      </div>
    </>
  );
}
