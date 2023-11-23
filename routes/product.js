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
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

module.exports = (config) => {

    const router = express.Router();
    const db = config.database.client;
    const Product = db.model('Product', Schemas.product);

    /**
     * Create a new product
     */
    router.post("/create", upload.single('image'), async (req, res) => {

        const product = JSON.parse(req.body.product);
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

                await sharp(filePath)
                    .rotate() // Rotate the image based on orientation metadata
                    .resize(200, 200)
                    .toBuffer()
                    .then(buffer => {
                        return s3Commands.addObject('thumbnail_' + req.file.filename, buffer);
                    }).catch(err => console.log('sharp 2: ' + err));
            }

            const newProduct = await Product.create(
                {
                    ...product,
                    photo: req.file && req.file.filename || '',
                    thumb: req.file && 'thumbnail_' + req.file.filename || ''
                });

            res.send({
                data: newProduct,
                message: "Product created",
            });
        } catch (error) {
            console.log(error);
            res.status(400).send({
                message: "Failed to create product",
                error: error,
            });
        }
    });

    router.put('/', upload.single('image'), async (req, res) => {
        const product = JSON.parse(req.body.product);
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

                await sharp(filePath)
                    .rotate() // Rotate the image based on orientation metadata
                    .resize(200, 200)
                    .toBuffer()
                    .then(buffer => {
                        return s3Commands.addObject('thumbnail_' + req.file.filename, buffer);
                    }).catch(err => console.log('sharp 2: ' + err));
            }
            const updatedProduct = await Product.findOneAndUpdate({ _id: product._id }, {
                ...product,
                photo: req.file && req.file.filename || '',
                thumb: req.file && 'thumbnail_' + req.file.filename || ''
            }, { new: true });
            res.send({
                message: "Product updated",
                data: updatedProduct
            });

        } catch (error) {
            res.status(400).send({
                message: "Failed to create product",
                error: error,
            });
        }
    });

    /**
    * get products with pagination
    */
    router.get('/pagination/:from/:limit', async (req, res) => {
        const from = req.params.from;
        const limit = req.params.limit;

        try {
            const products = await Product.aggregate([
                {
                    $skip: +from,
                }, {
                    $limit: +limit,
                }]);

            await Promise.all(products.map(async product => {

                if (product.photo) {
                    product.photourl = await s3Commands.getSignedUrl(product.photo);
                }

                if (product.thumb) {
                    product.thumburl = await s3Commands.getSignedUrl(product.thumb);
                }

                return product;
            })).then(result => {
                res.send({
                    message: "Product found",
                    data: result
                });
            });

        } catch (error) {
            res.status(400).send({
                message: "Failed to find products",
                error: error,
            });
        }
    });

    /**
     * get all products
     */
    router.get('/', async (req, res) => {

        try {
            const products = await Product.find({});
            if (products.length > 0) {
                products.map(p => {
                    p.photo = p.photo ? s3Commands.getObjectUrl(p.photo) : '';
                    p.thumb = p.thumb ? s3Commands.getObjectUrl(p.thumb) : '';
                });
            }
            res.send({
                message: "Product found",
                data: products
            });

        } catch (error) {
            res.status(400).send({
                message: "Failed to find products",
                error: error,
            });
        }
    });

    /**
    * get product by id
    */
    router.get('/:id', async (req, res) => {
        const id = req.params.id;
        try {
            const product = await Product.findOne({ _id: id });

            if (product) {
                product.photo = product.photo ? s3Commands.getObjectUrl(product.photo) : '';
                product.thumb = product.thumb ? s3Commands.getObjectUrl(product.thumb) : '';
            }
            res.send({
                message: "Product found",
                data: product,
            });

        } catch (error) {
            console.log(error);
            res.status(400).send({
                message: "Failed to find products",
                error: error,
            });
        }
    });

    /**
     * Delete a product
     */
    router.delete("/:id", async (req, res) => {
        const id = req.params.id;
        try {
            // first find the product
            const product = await Product.findOne({ _id: id });

            // delete the images
            if (product) {
                await s3Commands.deleteObject(product.thumb);
                await s3Commands.deleteObject(product.photo);
            }
            await Product.deleteOne({
                _id: id
            });

            res.send({
                message: "Product deleted",
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "Failed to delete product",
                error: error,
            });
        }

    });

    return router;
};
