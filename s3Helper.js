const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const {
  getSignedUrl,
} = require("@aws-sdk/s3-request-presigner");
require('dotenv').config();
const { S3Client } = require("@aws-sdk/client-s3");

// Create an Amazon S3 service client object.
const s3Client = new S3Client({
    credentials: {
        accessKeyId: process.env.ACCESSKEYID,
        secretAccessKey: process.env.SECRETACCESSKEY,
    },
    region: 'us-east-2'
});

const s3Commands = {
    getSignedUrl: (key) => {
        const command = new GetObjectCommand({
            Bucket: process.env.BUCKETNAME,
            Key: key,
          });
          return getSignedUrl(s3Client, command, { expiresIn: 5 * 86400 }); // 5 days
    },

    addObject: (key, buffer) => {
        const putCommand = new PutObjectCommand({
            Bucket: process.env.BUCKETNAME,
            Key: key,
            Body: buffer
          });

          return s3Client.send(putCommand);
    },
    deleteObject : (key) => {
        const deleteCommand = new DeleteObjectCommand({
            Bucket: process.env.BUCKETNAME,
            Key: key,
          });

          return s3Client.send(deleteCommand);
    },
    getObjectUrl: (object) => {
        // https://[BUCKET].s3.[REGION].amazonaws.com/[OBJECT]
        return `https://${process.env.BUCKETNAME}.s3.${process.env.REGION}.amazonaws.com/${object}`;
    }
}

module.exports = s3Commands;
