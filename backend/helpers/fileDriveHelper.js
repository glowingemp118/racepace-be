const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
const apikeys = require("../config/drive_key.json"); // make sure this path is correct

const SCOPES = ["https://www.googleapis.com/auth/drive"];

const authorize = async () => {
  const jwtClient = new google.auth.JWT(
    apikeys.client_email,
    null,
    apikeys.private_key,
    SCOPES
  );
  await jwtClient.authorize();
  return jwtClient;
};

const setFilePublic = async (fileId) => {
    try {
      const authClient = await authorize();
      const drive = google.drive({ version: "v3", auth: authClient });
  
      await drive.permissions.create({
        fileId,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
      });
  
      console.log(` File ${fileId} is now public`);
      return true;
    } catch (error) {
      console.error(" Error making file public:", error.message);
      throw error;
    }
  };

const uploadFileGetUrl = async (file, folderId = null) => {
    try {
      if (!file || !file.name) {
        throw new Error("Invalid file: missing file object or name.");
      }
  
      const authClient = await authorize();
      const drive = google.drive({ version: "v3", auth: authClient });
  
      const ext = path.extname(file.name);
      const filename = `${Date.now()}${ext}`;
  
      const media = {
        mimeType: file.mimetype || "application/octet-stream",
        body: fs.createReadStream(file?.tempFilePath || file?.path),
      };
  
      const fileMetaData = {
        name: filename,
        ...(folderId ? { parents: [folderId] } : {}),
      };
  
      const response = await drive.files.create({
        resource: fileMetaData,
        media,
        fields: "id, name, webViewLink, webContentLink",
      });
  
      const uploaded = response.data;
  
      //  Make it public
      await setFilePublic(uploaded.id);
  
      return {
        fileName: uploaded.name,
        path: `https://drive.google.com/file/d/${uploaded.id}/view`,
        downloadUrl: `https://drive.google.com/uc?id=${uploaded.id}&export=download`,
        fileId: uploaded.id,
      };
    } catch (error) {
      console.error(" Error uploading file:", error.message);
      throw error;
    }
  };
const deleteFileById = async (fileId) => {
  try {
    const authClient = await authorize();
    const drive = google.drive({ version: "v3", auth: authClient });

    await drive.files.delete({ fileId });
    return `File with ID ${fileId} deleted successfully.`;
  } catch (error) {
    console.error(" Error deleting file:", error.message);
    throw error;
  }
};

module.exports = {
  uploadFileGetUrl,
  deleteFileById,
};
