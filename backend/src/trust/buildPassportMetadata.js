const fs = require("fs");
const path = require("path");

async function buildPassportMetadata({
  tokenId,
  verificationLevel,
  trustScore,
  completedEscrows,
  disputeRatio,
  skills,
  imageCID,
}) {
  const metadata = {
    name: `Veritas Passport #${tokenId}`,

    description:
      "Portable decentralized trust identity for Veritas Protocol",

    image: `ipfs://${imageCID}`,

    attributes: [
      {
        trait_type: "Verification Level",
        value: verificationLevel,
      },

      {
        trait_type: "Trust Score",
        value: trustScore,
      },

      {
        trait_type: "Completed Escrows",
        value: completedEscrows,
      },

      {
        trait_type: "Dispute Ratio",
        value: disputeRatio,
      },

      {
        trait_type: "Skills",
        value: skills.join(", "),
      },
    ],
  };

  const outputDir = path.join(
    __dirname,
    "../../temp"
  );

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  const filePath = path.join(
    outputDir,
    `passport-${tokenId}.json`
  );

  fs.writeFileSync(
    filePath,
    JSON.stringify(metadata, null, 2)
  );

  return filePath;
}

module.exports = {
  buildPassportMetadata,
};