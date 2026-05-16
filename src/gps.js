export function getCurrentPosition(options = {}) {
  if (!navigator.geolocation) {
    return Promise.reject(new Error("Geolocation is not supported by this browser."));
  }

  const finalOptions = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 5000,
    ...options
  };

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, finalOptions);
  });
}
