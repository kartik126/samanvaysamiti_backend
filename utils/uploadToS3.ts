const s3 = require("../config/s3config");

export const uploadToS3 = async (email: string, imageBuffer: Buffer) => {
  try {
    const s3UploadParams = {
      Bucket: "samanvaysamiti-uploads",
      Key: `profile-images/${email}.jpg`,
      Body: imageBuffer,
      ContentType: "image/jpeg",
      ACL: "public-read",
      PartSize: 10 * 1024 * 1024,
      httpOptions: {
        timeout: 600000,
      },
    };

    const s3UploadResult = await s3
      .upload(s3UploadParams)
      .on("httpUploadProgress", (progress:any) => {
        console.log("upload progress...",progress)
      })
      .promise();

    return s3UploadResult.Location;
  } catch (error) {
    throw error;
  }
};
