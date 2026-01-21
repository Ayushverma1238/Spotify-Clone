let currSong = new Audio();
let songs;
let currFolder;

function secondsToMinSec(totalSeconds) {
  if (isNaN(totalSeconds || totalSeconds < 0)) {
    return "00:00";
  }
  let minutes = Math.floor(totalSeconds / 60);
  let seconds = Math.floor(totalSeconds % 60);

  // add leading zero if needed
  if (seconds < 10) seconds = "0" + seconds;

  return `${minutes}:${seconds}`;
}

async function getSongs(folder) {
  let res = await fetch(`http://127.0.0.1:3000/SpotifyClone/${folder}/`);
  currFolder = folder;
  let html = await res.text();

  let div = document.createElement("div");
  div.innerHTML = html;

  let as = div.getElementsByTagName("a");
  songs = [];

  for (let a of as) {
    if (a.href.endsWith(".mp3")) {
      const decoded = decodeURIComponent(a.href); // 🔥 REQUIRED
      const cleanUrl = decoded
        .replace(/\\/g, "/")
        .replace("/SpotifyClone//SpotifyClone/", "/SpotifyClone/");

      songs.push(cleanUrl);
    }
  }

  let songUl = document.querySelector(".songList ul");
  //   songUl.innerHTML = ""; // clear old content
  songUl.innerHTML = "";
  for (const song of songs) {
    let songName = decodeURIComponent(song.split("/").pop());
    let li = `<li class="rounded">
                            <img class="music-icon" src="assets/SVG/music.svg" alt="music">
                            <div class="info">
                                <div>${songName}</div>
                                <div>Ayush Verma</div>
                            </div>
                            <div class="playNow">
                                <span>Play Now</span>
                                <img class="play-b" src="assets/SVG/play.svg" alt="play">
                            </div>
                </li>`;
    songUl.innerHTML = songUl.innerHTML + li;
  }
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li"),
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
    // console.log(e.querySelector(".info").firstElementChild.innerHTML);
  });

  return songs; // ✅ return array
}

const playMusic = (track, pause = false) => {
  //   let audio = new Audio("/SpotifyClone/songs/" + track); // empty first
  // play first song
  currSong.src = `/SpotifyClone/${currFolder}/` + track;
  if (!pause) {
    currSong.load();
    currSong
      .play()

      .catch((err) => console.error(err));
    play.src = "/SpotifyClone/assets/SVG/pause.svg";
  }

  document.querySelector(".songInfo").innerHTML = track;
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
  //   currSong.addEventListener("loadeddata", () => {
  //     let duration = currSong.duration;
  //     console.log(currSong.duration, currSong.currentSrc, currSong.currentTime);
  //   });
};

async function displayAlbums() {
  let a = await fetch("http://127.0.0.1:3000/SpotifyClone/songs/");
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;

  let anchors = div.getElementsByTagName("a");
  let cardContainers = document.querySelector(".cardContainers");
  let arr = Array.from(anchors);
  for (let index = 0; index < arr.length; index++) {
    const e = arr[index];
    {
      const decoded = decodeURIComponent(e.href);

      const cleanUrl = decoded
        .replace(/\\/g, "/")
        .replace("/SpotifyClone//SpotifyClone/", "/SpotifyClone/");

      if (cleanUrl.includes("/SpotifyClone")) {
        // console.log(cleanUrl);
        let folder = cleanUrl.split("/").slice(-2)[0]; // album name
        let a = await fetch(
          `http://127.0.0.1:3000/SpotifyClone/songs/${folder}/info.json`,
        );
        let response = await a.json();
        cardContainers.innerHTML =
          cardContainers.innerHTML +
          `<div data-folder="${folder}" class="card p-1">
                        <svg width="50" height="50" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="50" cy="50" r="48" fill="#1DB954" />
                            <polygon points="42,32 42,68 70,50" fill="black" />
                        </svg>
                        <img src="/SpotifyClone/songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.discription}</p>
                    </div>`;
      }
    }
  }
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    // console.log(e);

    e.addEventListener("click", async (item) => {
   
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0].split("/").pop());
      // item.dataset.folder
    });
  });
}

async function main() {
  await getSongs("songs/honeySingh/");
  let songName = decodeURIComponent(songs[0].split("/").pop());
  document.querySelector("#volume1").value = currSong.volume.toString();
  playMusic(songName, true);

  let album = await displayAlbums();

  play.addEventListener("click", () => {
    if (currSong.paused) {
      currSong.play();
      play.src = "/SpotifyClone/assets/SVG/pause.svg";
    } else {
      currSong.pause();
      play.src = "/SpotifyClone/assets/SVG/play.svg";
    }
  });

  currSong.addEventListener("timeupdate", () => {
    if (isNaN(currSong.duration) || currSong.duration === 0) return;
    // console.log(currSong.currentTime, currSong.duration);
    document.querySelector(".songtime").innerHTML = `${secondsToMinSec(
      currSong.currentTime,
    )} / ${secondsToMinSec(currSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currSong.currentTime / currSong.duration) * 100 + "%";
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let per = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = per + "%";
    currSong.currentTime = (currSong.duration * per) / 100;
  });

  document.querySelector(".hamBurger").addEventListener("click", (e) => {
    document.querySelector(".left").style.left = "0";
  });

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-130%";
  });

  document.querySelector("#prev").addEventListener("click", () => {
    let index = songs.indexOf(currSong.src);
    if (index - 1 < 0) {
      index = songs.length;
    }
    document.querySelector("#prev").style.width = "35px";
    document.querySelector("#next").style.width = "40px";

    let songName = decodeURIComponent(songs[index - 1].split("/").pop());
    playMusic(songName);
  });

  document.querySelector("#next").addEventListener("click", () => {
    // console.log(currSong.src);
    document.querySelector("#next").style.width = "35px";
    document.querySelector("#prev").style.width = "40px";

    let index = songs.indexOf(currSong.src);
    if (index + 1 >= songs.length) {
      index = -1;
    }

    let songName = decodeURIComponent(songs[index + 1].split("/").pop());
    playMusic(songName);
  });

  const volumeRange = document.querySelector("#volume1");

  // Slider → Audio
  volumeRange.addEventListener("input", () => {
    currSong.volume = volumeRange.value;
    let img = document.querySelector(".volume > img")
     if(currSong.volume == 0){
      img.src = "assets/SVG/mute.svg";
    }else{
      img.src = "assets/SVG/volume.svg";
    }
  });

  // External change → Slider
  function setVolume(vol) {
    currSong.volume = vol;
    volumeRange.value = vol * 100;
   
  }

  document.querySelector(".volume > img").addEventListener("click", (e) => {
    const img = e.target;

    if (img.src.includes("volume.svg")) {
      img.src = "assets/SVG/mute.svg";
      currSong.volume = 0;
      document.querySelector("#volume1").value = 0;
    } else {
      img.src = "assets/SVG/volume.svg";
      currSong.volume = 0.1;
      document.querySelector("#volume1").value = currSong.volume.toString();
    }

    // console.log("Volume:", currSong.volume);
  });
}

main();
