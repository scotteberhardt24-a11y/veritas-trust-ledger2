const {
  buildPassportMetadata,
} = require("../trust/buildPassportMetadata");

const {
  uploadToIPFS,
} = require("../trust/ipfsUpload");

async function createPassportMetadata({
  tokenId,
  verificationLevel,
  trustScore,
  completedEscrows,
  disputeRatio,
  skills,
  imageCID,
}) {
  // STEP 1
  const metadataFile =
    await buildPassportMetadata({
      tokenId,
      verificationLevel,
      trustScore,
      completedEscrows,
      disputeRatio,
      skills,
      imageCID,
    });

  // STEP 2
  const metadataURI =
    await uploadToIPFS(metadataFile);

  return metadataURI;
}

module.exports = {
  createPassportMetadata,
};