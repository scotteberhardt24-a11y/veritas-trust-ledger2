const fs = require("fs");

const axios = require("axios");

const FormData = require("form-data");

async function uploadToIPFS(filePath) {
  const data = new FormData();

  data.append(
    "file",
    fs.createReadStream(filePath)
  );

  const response = await axios.post(
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    data,
    {
      maxBodyLength: Infinity,

      headers: {
        ...data.getHeaders(),

        pinata_api_key:
          process.env.PINATA_API_KEY,

        pinata_secret_api_key:
          process.env.PINATA_SECRET,
      },
    }
  );

  return `ipfs://${response.data.IpfsHash}`;
}

module.exports = {
  uploadToIPFS,
};