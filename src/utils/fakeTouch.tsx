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
