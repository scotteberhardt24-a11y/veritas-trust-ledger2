import fs from "fs";
import axios from "axios";
import FormData from "form-data";
import dotenv from "dotenv";

dotenv.config();

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
  throw new Error("Missing Pinata environment variables");
}

/**
 * Upload any file to IPFS via Pinata
 * Returns ipfs://CID
 */
export async function uploadFileToIPFS(filePath) {
  const data = new FormData();

  data.append("file", fs.createReadStream(filePath));

  const response = await axios.post(
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    data,
    {
      maxBodyLength: Infinity,
      headers: {
        ...data.getHeaders(),
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
    }
  );

  const cid = response.data.IpfsHash;

  return `ipfs://${cid}`;
}

/**
 * Upload JSON metadata directly (no file needed)
 */
export async function uploadJSONToIPFS(jsonData) {
  const response = await axios.post(
    "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    jsonData,
    {
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
    }
  );

  const cid = response.data.IpfsHash;

  return `ipfs://${cid}`;
}