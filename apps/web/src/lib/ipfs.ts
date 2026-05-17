export function resolveIPFS(uri: string) {
  if (!uri) return "";

  return uri.replace(
    "ipfs://",
    "https://ipfs.io/ipfs/"
  );
}