const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
// const fs = require('fs').promises;
const S3 = new S3Client({
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.S3KEY,
    secretAccessKey: process.env.S3SECRET,
  },
});

const BUCKET_NAME = process.env.FILEUPLOADBUCKETNAME;

const sanitizeFileName = (fileName) => {
  let sanitizedFileName = fileName.replace(/\s+/g, "_");
  sanitizedFileName = sanitizedFileName.replace(/[^a-zA-Z0-9_.\-]/g, "");
  return sanitizedFileName;
};

const uploadFileGetUrl = async (file) => {
  try {
    const ext = file?.name?.split(".");
    const extension = ext[ext.length - 1];
    const imagenamefinal = `${Date.now()}.${extension}`;
    const fileType =  file?.mimetype || "application/octet-stream";
    const fileData=file.data;
    // const fileData= await fs.readFile(file.tempFilePath);
    const params = {
      Body: fileData,
      Bucket: BUCKET_NAME,
      Key: imagenamefinal,
      ContentType: fileType,
    };

    await S3.send(new PutObjectCommand(params));

    return {
      path: `${process.env.IMAGEBASEURLAWS}${imagenamefinal}`,
      fileName: imagenamefinal,
    };
  } catch (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }
};

const deleteFileByName = async (fileName) => {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: fileName,
    };

    const data = await S3.send(new DeleteObjectCommand(params));
    return data;
  } catch (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
};

module.exports = { uploadFileGetUrl, deleteFileByName };
