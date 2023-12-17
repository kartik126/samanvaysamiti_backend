const AWS = require('aws-sdk');
require('dotenv').config()

AWS.config.update({
  accessKeyId:process.env.ACCESSKEYID,
  secretAccessKey:process.env.SECRETACCESSKEY,
  region: 'ap-south-1',
});

const s3 = new AWS.S3();

module.exports = s3;

