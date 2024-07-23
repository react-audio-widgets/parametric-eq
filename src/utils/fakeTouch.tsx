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

export type FakeTouch = {
  delay: () => void;
};

export function useFakeTouch(
  onFakeTouch: (touched: boolean) => void,
  delay: number
): [(touched: boolean) => void, React.MutableRefObject<boolean>] {
  const fakeTouchRef = React.useRef<boolean>(false);
  const fakeTouchTimeoutRef = React.useRef<number | undefined>(undefined);

  const onTouch = React.useCallback(
    (touched: boolean) => {
      if (touched) {
        if (!fakeTouchRef.current) {
          fakeTouchRef.current = true;
          if (onFakeTouch) {
            onFakeTouch(true);
          }
        }
      } else {
        if (fakeTouchTimeoutRef.current != null) {
          clearTimeout(fakeTouchTimeoutRef.current);
        }
        fakeTouchTimeoutRef.current = setTimeout(() => {
          if (fakeTouchTimeoutRef.current != null) {
            clearTimeout(fakeTouchTimeoutRef.current);
          }
          fakeTouchRef.current = false;
          if (onFakeTouch) {
            onFakeTouch(false);
          }
        }, delay);
      }
    },
    [delay, onFakeTouch]
  );

  return [onTouch, fakeTouchRef];
}
