type CacheItem<T> = {
  data: T;
  lastFetchTime: number;
};

const cacheStore: { [key: string]: CacheItem<any> } = {};
const cacheDuration: number = 5 * 60 * 1000 // 5 minutes in milliseconds

export async function cachedFetch<T>(
  key: string,
  fetchFunction: () => Promise<T>,
): Promise<T> {
  const currentTime = Date.now();
  const cachedItem = cacheStore[key];

  if (cachedItem && currentTime - cachedItem.lastFetchTime < cacheDuration) {
    return cachedItem.data;
  }

  const freshData = await fetchFunction();
  cacheStore[key] = {
    data: freshData,
    lastFetchTime: currentTime,
  };

  return freshData;
}
