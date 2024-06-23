const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = 3000;

// Set storage engine
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Init upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // Limit file size to 10MB
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    }
}).single('image');

// Check file type
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

app.use(express.static('public'));

app.post('/upload', (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            res.send(`Error: ${err}`);
        } else {
            if (req.file == undefined) {
                res.send('Error: No File Selected!');
            } else {
                const filePath = `uploads/${req.file.filename}`;
                const outputFilePath = `uploads/${Date.now()}.webp`;
                const quality = parseInt(req.body.quality) || 80; // Default quality to 80 if not specified

                try {
                    await sharp(filePath)
                        .webp({ quality: quality })
                        .toFile(outputFilePath);

                    res.download(outputFilePath, async (err) => {
                        if (err) {
                            res.send(`Error: ${err}`);
                        } else {
                            try {
                                await fs.unlink(filePath); // Remove original file
                                await fs.unlink(outputFilePath); // Remove converted file after download
                            } catch (err) {
                                console.error(`Error: ${err}`);
                            }
                        }
                    });
                } catch (err) {
                    res.send(`Error: ${err}`);
                }
            }
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
