import { randFirstName, seed } from "@ngneat/falso";
// import type { UID } from "agora-rtc-react";
// import type { RefObject } from "react";
import { useCallback, useEffect, useRef } from "react";

export const fakeName = (uid) => {
  seed(String(uid));
  const name = randFirstName();
  seed();
  return name;
};

export const fakeAvatar = () => {
  return "https://www.agora.io/en/wp-content/uploads/2022/10/3d-spatial-audio-icon.svg";
};

export function useIsUnmounted() {
  const isUnmountRef = useRef(false);
  useEffect(() => {
    isUnmountRef.current = false;
    return () => {
      isUnmountRef.current = true;
    };
  }, []);
  return isUnmountRef;
}

export function useSafePromise() {
  const isUnmountRef = useIsUnmounted();

  function safePromise(promise, onUnmountedError) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {  // Corrected this line
      try {
        const result = await promise;
        if (!isUnmountRef.current) {
          resolve(result);
        }
      } catch (error) {
        if (!isUnmountRef.current) {
          reject(error);
        } else if (onUnmountedError) {
          onUnmountedError(error);
        } else {
          // Log error for development
          console.error(
            "An error occurs from a promise after a component is unmounted",
            error
          );
        }
      }
    });
  }

  return useCallback(safePromise, [isUnmountRef]);
}

