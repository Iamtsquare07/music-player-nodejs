document.addEventListener("DOMContentLoaded", () => {
    const songs = [];

    // Function to fetch the list of songs in the "songs" folder
    fetch("/songs")
        .then((response) => response.json())
        .then((data) => {
            songs.length = 0; // Clear the existing songs array
            songs.push(...data);

            renderPlaylist(); // Call renderPlaylist after the songs are loaded
        })
        .catch((error) => {
            console.error("Error fetching song data:", error);
        });



    const playlist = document.getElementById("playlist");
    const audioPlayer = document.getElementById("audio-player");
    const shuffleButton = document.getElementById("shuffle");
    const addToPlaylistButton = document.getElementById("add-to-playlist");
    const likeButton = document.getElementById("like");
    const previousButton = document.getElementById("previous");
    const pauseButton = document.getElementById("pause");
    const nextButton = document.getElementById("next");
    const progress = document.getElementById("progress");

    let currentSongIndex = 0;
    let isShuffleOn = false;


    function loadSong(index) {
        if (index >= 0 && index < songs.length) {
            const song = songs[index];
            console.log("Loading song:", song); // Debugging statement
            audioPlayer.src = song.src;
            audioPlayer.load(); // Load the new source
            audioPlayer.play(); // Play the song
            audioPlayer.addEventListener("ended", nextSong);
            document.querySelector('.playing').textContent = song.title;
            pauseButton.innerHTML = '<i class="fa-solid fa-pause"></i>';
            document.getElementById('like').style.visibility = 'visible';
        } else {
            console.error("Invalid song index:", index); // Debugging statement
        }
    }


    previousButton.addEventListener("click", () => {
        currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
        loadSong(currentSongIndex);
    });

    pauseButton.addEventListener("click", () => {
        if (audioPlayer.paused) {
            if (!audioPlayer.src) {
                // If no song is currently loaded, check if shuffle mode is on
                if (isShuffleOn) {
                    // Play a random song
                    const randomIndex = getRandomIndex();
                    loadSong(randomIndex);
                } else {
                    // Play the first song
                    loadSong(0);
                }
            } else {
                audioPlayer.play();
            }
            pauseButton.innerHTML = '<i class="fa-solid fa-pause"></i>';
        } else {
            audioPlayer.pause();
            pauseButton.innerHTML = '<i class="fa-solid fa-play"></i>';
        }
    });


    nextButton.addEventListener("click", nextSong);

    function nextSong() {
        currentSongIndex = isShuffleOn ? getRandomIndex() : (currentSongIndex + 1) % songs.length;
        loadSong(currentSongIndex); // Call loadSong to play the next song
    }


    function getRandomIndex() {
        return Math.floor(Math.random() * songs.length);
    }

    function renderPlaylist() {
        playlist.innerHTML = "";
        songs.forEach((song, index) => {
            const listItem = document.createElement("li");
            listItem.innerHTML = `
                <span class="song-title">${song.title}</span>
                <i class="fa-regular fa-heart like-button" data-index="${index}"></i>
            `;

            listItem.addEventListener("click", () => {
                currentSongIndex = index;
                loadSong(currentSongIndex);
            });

            const likeButton = listItem.querySelector(".like-button");
            likeButton.addEventListener("click", (event) => {
                event.stopPropagation();
                const index = parseInt(likeButton.getAttribute("data-index"));
                currentSongIndex = index;
                saveLikedSongs(); // Save liked songs upon like/unlike button click
            });

            playlist.appendChild(listItem);
        });


        // Update like buttons based on liked songs
        const likeButtons = document.querySelectorAll(".like-button");
        likeButtons.forEach((likeButton, index) => {
            const song = songs[index];
            if (likedSongs.some((likedSong) => likedSong.title === song.title)) {
                likeButton.classList.remove("fa-regular");
                likeButton.classList.add("fa-solid");
            }
        });
    }



    shuffleButton.addEventListener("click", () => {
        isShuffleOn = !isShuffleOn;
        shuffleButton.classList.toggle("active", isShuffleOn);
    });

    addToPlaylistButton.addEventListener("click", () => {
        const newSong = { title: `Song ${songs.length + 1}`, src: "new-song.mp3" };
        songs.push(newSong);
        renderPlaylist();
    });

    // Function to load liked songs from local storage
    function loadLikedSongs() {
        const likedSongsJSON = localStorage.getItem("likedSongs");
        return likedSongsJSON ? JSON.parse(likedSongsJSON) : [];
    }

    // Function to save liked songs to local storage and update like buttons
    function saveLikedSongs() {
        const currentSong = songs[currentSongIndex];
        const likeIcon = likeButton;

        const isLiked = likedSongs.some((song) => song.title === currentSong.title);

        if (isLiked) {
            // If the current song is already liked, unliking it
            const likedIndex = likedSongs.findIndex((song) => song.title === currentSong.title);
            likedSongs.splice(likedIndex, 1);
            likeIcon.classList.remove("fa-solid");
            likeIcon.classList.add("fa-regular");
            alert(`Removed from Liked: ${currentSong.title}`);
        } else {
            // If the current song is not liked, liking it
            likedSongs.push(currentSong);
            likeIcon.classList.remove("fa-regular");
            likeIcon.classList.add("fa-solid");
            alert(`Liked: ${currentSong.title}`);
        }

        localStorage.setItem("likedSongs", JSON.stringify(likedSongs));
    }

    // Load liked songs when the page loads
    let likedSongs = loadLikedSongs();

    // Update the liked songs list and save to local storage when a song is liked
    likeButton.addEventListener("click", () => {
        saveLikedSongs();
    });

    renderPlaylist();
    loadSong(currentSongIndex);


    const likedSongsModal = document.getElementById("liked-songs-modal");
    const playlistsModal = document.getElementById("playlists-modal");
    const likedSongsButton = document.querySelector(".liked");
    const playlistsButton = document.querySelector(".playlist-menu");
    const closeButtons = document.querySelectorAll(".close");

    likedSongsButton.addEventListener("click", () => {
        likedSongsModal.style.display = "block";
        renderLikedSongs();
    });


    likedSongsButton.addEventListener("click", () => {
        likedSongsModal.style.display = "block";
        renderLikedSongs(); // Call renderLikedSongs when the button is clicked
    });
    playlistsButton.addEventListener("click", () => {
        playlistsModal.style.display = "block";
    });

    closeButtons.forEach((closeButton) => {
        closeButton.addEventListener("click", () => {
            likedSongsModal.style.display = "none";
            playlistsModal.style.display = "none";
        });
    });

    window.addEventListener("click", (event) => {
        if (event.target === likedSongsModal || event.target === playlistsModal) {
            likedSongsModal.style.display = "none";
            playlistsModal.style.display = "none";
        }
    });


    function renderLikedSongs() {
        const likedSongsList = document.getElementById("liked-songs-list");
        likedSongsList.innerHTML = ""; // Clear previous content

        likedSongs.forEach((song, index) => {
            const listItem = document.createElement("li");
            listItem.textContent = song.title;
            listItem.classList.add("liked-song-item"); // Add a class for styling
            listItem.setAttribute("data-index", index); // Store the index in a data attribute
            likedSongsList.appendChild(listItem);
        });

        // Add click event listeners to the liked song items
        const likedSongItems = document.querySelectorAll(".liked-song-item");
        likedSongItems.forEach((item) => {
            item.addEventListener("click", () => {
                const index = item.getAttribute("data-index");
                currentSongIndex = index;
                loadSong(currentSongIndex);
                likedSongsModal.style.display = "none"; // Close the modal when a song is clicked
            });
        });
    }
})