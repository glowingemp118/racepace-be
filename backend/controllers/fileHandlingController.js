
const { uploadFileGetUrl, deleteFileByName } = require("../helpers/fileHelper");
const { successResponse, PrintError } = require("../middleware/common");

const uploadFileApi = async (req, res) => {
  try {
    const file = req.files?.file;

    if (!file) {
      throw new Error("Invalid file");
    }

    const uploadedFile = await uploadFileGetUrl(file);

    if (!uploadedFile) {
      throw new Error("File upload failed");
    }

    return successResponse(200, "File uploaded successfully", uploadedFile, res);
  } catch (error) {
    return PrintError(400, error.message, res);
  }
};

const deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      throw new Error("fileId is required");
    }

    const result = await deleteFileByName(fileId);
    return successResponse(200, result, {}, res);
  } catch (error) {
    return PrintError(400, error.message, res);
  }
};

module.exports = {
  uploadFileApi,
  deleteFile,
};
