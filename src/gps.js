const DEFAULT_GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 5000
};

export function getCurrentPosition(options = {}) {
  if (!navigator.geolocation) {
    return Promise.reject(new Error("Geolocation is not supported by this browser."));
  }

  const finalOptions = {
    ...DEFAULT_GEOLOCATION_OPTIONS,
    ...options
  };

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, finalOptions);
  });
}

export function watchCurrentPosition({ onPosition, onError } = {}, options = {}) {
  if (!navigator.geolocation) {
    throw new Error("Geolocation is not supported by this browser.");
  }

  if (typeof onPosition !== "function") {
    throw new Error("GPS watch requires an onPosition callback.");
  }

  const finalOptions = {
    ...DEFAULT_GEOLOCATION_OPTIONS,
    maximumAge: 2000,
    ...options
  };

  const watchId = navigator.geolocation.watchPosition(
    onPosition,
    (error) => {
      if (typeof onError === "function") {
        onError(error);
      }
    },
    finalOptions
  );

  return () => {
    navigator.geolocation.clearWatch(watchId);
  };
}
