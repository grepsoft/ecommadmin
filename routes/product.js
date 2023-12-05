const express = require("express");
const Schemas = require('../schemas');
const s3Commands = require("../s3Helper");
const multer = require('multer');
const fs = require('fs');
const sharp = require('sharp');
const url = require('url');

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
                    .resize(400, 400)
                    .toBuffer()
                    .then(buffer => {
                        return s3Commands.addObject('thumbnail_' + req.file.filename, buffer);
                    }).catch(err => console.log('sharp 2: ' + err));
            }

            const newProduct = await Product.create(
                {
                    ...product,
                    photo: req.file && s3Commands.getObjectUrl(req.file.filename) || '',
                    thumb: req.file && s3Commands.getObjectUrl('thumbnail_' + req.file.filename) || ''
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

            // find product
            const existingProduct = await Product.findById(product._id);

            if (existingProduct) {
                existingProduct.name = product.name;
                existingProduct.color = product.color;
                existingProduct.description = product.description;
                existingProduct.category = product.category;
                existingProduct.quantity = product.quantity;
                existingProduct.price = product.price;
                existingProduct.photo = req.file && s3Commands.getObjectUrl(req.file.filename) || existingProduct.photo;
                existingProduct.thumb = req.file && s3Commands.getObjectUrl('thumbnail_' + req.file.filename) || existingProduct.thumb;

                await existingProduct.save()
            }
            // const updatedProduct = await Product.findOneAndUpdate({ _id: product._id }, {
            //     ...product,
            //     photo: req.file && req.file.filename || '',
            //     thumb: req.file && 'thumbnail_' + req.file.filename || ''
            // }, { new: true });

            res.send({
                message: "Product updated",
                data: existingProduct
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
            const total = await Product.find({});

            const products = await Product.aggregate([
                {
                    $skip: +from,
                },
                {
                    $limit: +limit,
                },
                {
                    $project: {
                        name: 1,
                        price: 1,
                        description: 1,
                        stock: 1,
                        photo: 1,
                        thumb: 1,
                        quantity: 1,
                    }
                }
            ]);

            res.send({
                message: "Product found",
                data: products,
                total: total.length
            });

        } catch (error) {
            console.log(error)
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
    router.delete("/single/:id", async (req, res) => {
        const id = req.params.id;
        try {
            // first find the product
            const product = await Product.findOne({ _id: id });

            // delete the images
            if (product) {
                const parsedThumbUrl = new URL(product.thumb);
                const parsedPhotoUrl = new URL(product.photo);

                // Access the pathname property to get the path part
                const thumbName = parsedThumbUrl.pathname;
                const photoName = parsedPhotoUrl.pathname;

                // Split the path by '/' and get the last part
                const thumbPathParts = thumbName.split('/');
                const photoPathParts = photoName.split('/');

                const thumb = thumbPathParts[thumbPathParts.length - 1];
                const photo = photoPathParts[photoPathParts.length - 1];

                await s3Commands.deleteObject(thumb);
                await s3Commands.deleteObject(photo);
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

    /**
    * Bulk Delete products
    */
    router.delete("/bulk", async (req, res) => {
        const products = req.body || [];

        if (products) {

            products.forEach(async id => {
                const product = await Product.findOne({ _id: id });

                // delete the images
                if (product) {
                    const parsedThumbUrl = new URL(product.thumb);
                    const parsedPhotoUrl = new URL(product.photo);

                    // Access the pathname property to get the path part
                    const thumbName = parsedThumbUrl.pathname;
                    const photoName = parsedPhotoUrl.pathname;

                    // Split the path by '/' and get the last part
                    const thumbPathParts = thumbName.split('/');
                    const photoPathParts = photoName.split('/');

                    const thumb = thumbPathParts[thumbPathParts.length - 1];
                    const photo = photoPathParts[photoPathParts.length - 1];

                    await s3Commands.deleteObject(product.thumb);
                    await s3Commands.deleteObject(product.photo);
                }

                await Product.deleteOne({
                    _id: id
                });
            });

            res.status(200).json({
                message: "Products deleted"
            })
        } else {
            res.status(200).json({
                message: "Nothing to delete"
            })
        }

    })
    return router;
};
