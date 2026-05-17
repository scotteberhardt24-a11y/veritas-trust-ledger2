import fs from "fs";

/**
 * Builds Veritas Identity Metadata JSON
 */
export function buildMetadata({
  name,
  wallet,
  verificationLevel,
  trustScore,
  role,
  imageCID,
}) {
  const metadata = {
    name: name || "Veritas Identity",
    description: "Decentralized trust identity on Veritas Network",
    image: imageCID ? `ipfs://${imageCID}` : "",
    attributes: [
      {
        trait_type: "Wallet",
        value: wallet,
      },
      {
        trait_type: "Verification Level",
        value: verificationLevel,
      },
      {
        trait_type: "Trust Score",
        value: trustScore,
      },
      {
        trait_type: "Role",
        value: role,
      },
    ],
  };

  fs.writeFileSync(
    "./metadata.json",
    JSON.stringify(metadata, null, 2)
  );

  return "./metadata.json";
}