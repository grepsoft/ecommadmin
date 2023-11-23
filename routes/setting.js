const express = require("express");
const Schemas = require('../schemas');
const s3Commands = require("../s3Helper");
const multer = require('multer');
const fs = require('fs');
const sharp = require('sharp');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = process.env.FILE_UPLOAD_DIRECTORY; // The directory to save uploaded files
        if (!fs.existsSync(uploadDir)) { // Check if the directory exists
            fs.mkdirSync(uploadDir); // Create the directory if it doesn't exist
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // change the filename here
        const originalname = file.originalname;
        const extension = originalname.split('.').pop();
        cb(null, Date.now() + '.' + extension);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB
    },
    fileFilter: (req, file, cb) => {
        if (file && file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

module.exports = (config) => {

    const router = express.Router();
    const db = config.database.client;
    const Setting = db.model('Setting', Schemas.settings);

    /**
     * Create settings
     */
    router.post("/create", upload.single('image'), async (req, res) => {

        try {

            if (req.file) {

                const filePath = req.file.path;
                await sharp(filePath)
                    .rotate()
                    .toBuffer()
                    .then(buffer => {
                        // save image first
                        return s3Commands.addObject(req.file.filename, buffer);
                    }).catch(err => console.log('sharp 1: ' + err));
            }

            const newSetting = await Setting.create(
                {
                    ...req.body,
                    bannerImage: req.file && req.file.filename || '',
                });

            res.send({
                data: newSetting,
                message: "Settings created",
            });
        } catch (error) {
            console.log(error);
            res.status(400).send({
                message: "Failed to create settings",
                error: error,
            });
        }
    });

    router.put('/:id', async (req, res) => {
        const id = req.params.id;
        try {
            const updatedSetting = await Setting.findOneAndUpdate({ _id: id }, { ...req.body }, { new: true });
            res.send({
                message: "Setting updated",
                data: updatedSetting
            });

        } catch (error) {
            res.status(400).send({
                message: "Failed to create Setting",
                error: error,
            });
        }
    });

    /**
     * get all settings
     */
    router.get('/', async (req, res) => {

        try {
            const settings = await Setting.find({});
            res.send({
                message: "Setting found",
                data: settings
            });

        } catch (error) {
            res.status(400).send({
                message: "Failed to find setting",
                error: error,
            });
        }
    });

    /**
    * get settings by id
    */
    router.get('/:id', async (req, res) => {
        const id = req.params.id;
        try {
            const settings = await Setting.find({ _id: id });
            res.send({
                message: "setting found",
                data: settings
            });

        } catch (error) {
            res.status(400).send({
                message: "Failed to find settings",
                error: error,
            });
        }
    });

    /**
     * Delete a setting
     */
    router.delete("/:id", async (req, res) => {
        const id = req.params.id;

        try {
            await Setting.deleteOne({
                _id: id
            });

            res.send({
                message: "Setting deleted",
            });

        } catch (error) {
            res.status(500).json({
                message: "Failed to delete setting",
                error: error,
            });
        }

    });

    return router;
};
