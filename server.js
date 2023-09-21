const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 3000;

app.use(express.static("public")); // Serve your HTML and client-side JS files from the "public" folder

app.get("/", (req, res) => {
    // Replace "index.html" with the actual name of your HTML file
    const indexPath = path.join(__dirname, "public", "index.html");
    fs.readFile(indexPath, "utf8", (err, data) => {
        if (err) {
            console.error("Error reading app file", err);
            res.status(500).send("Internal server error");
            return;
        }

        res.send(data);
    });
});


app.get("/songs", (req, res) => {
    const songsFolder = path.join(__dirname, "public/songs"); // Replace with the actual path to your "songs" folder
    fs.readdir(songsFolder, (err, files) => {
        if (err) {
            console.error("Error reading songs folder:", err);
            res.status(500).json({ error: "Internal server error" });
            return;
        }

        if (files.length === 0) {
            console.error("No songs found in the folder");
            res.status(404).json({ error: "No songs found" });
            return;
        }

        const songs = files.map((filename) => ({
            title: formatTitle(filename),
            src: `/songs/${filename}`,
        }));

        console.log("Songs loaded successfully");
        res.json(songs);
    });
});

function formatTitle(title) {
    // Split the title into words using dashes as separators
    const words = title.split('-');

    // Capitalize the first letter of each word (except the first word)
    for (let i = 0; i < words.length; i++) {
        words[i] = words[i][0].toUpperCase() + words[i].slice(1);
    }

    // Join the words back together without spaces and with camel casing
    const formattedTitle = words.join(' ');

    return formattedTitle.replace(/\.[^/.]+$/, "");
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
