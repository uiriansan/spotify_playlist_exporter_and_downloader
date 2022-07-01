const colors = require('../styles.js');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const NodeID3 = require('node-id3');
const moment = require('moment');
const ytsr = require('ytsr');
const utils = require('../utils.js');

const fs = require('fs');
const fetch = require('node-fetch');
const path = require('path');

const Spinnies = require('spinnies');
const spinners = new Spinnies({ spinnerColor: 'cyan' });

function getAlbumCover(cover_url) {
    return new Promise(async (resolve, reject) => {
        const write_path = path.resolve(path.join(__dirname + '/covers/'));
        
        if (!fs.existsSync(write_path)) fs.mkdirSync(write_path, {recursive: true});

        const respose = await fetch(cover_url);
        const buffer = await respose.buffer();
        fs.writeFileSync(write_path + '/cur.jpg', buffer);
        resolve(write_path + '/cur.jpg');
    });
}

async function setID3Tags(file, track_data) {
    // ID3 Reference -> https://id3.org/id3v2.3.0
    const cover = track_data.album_cover ? await getAlbumCover(track_data.album_cover) : '';
    const tags = {
        title: track_data.title,
        artist: track_data.artist,
        composer: track_data.artist,
        album: track_data.album,
        TDAT: moment(track_data.added_at).format('DDMM'), // Date
        TIME: moment(track_data.added_at).format('HHmm'), // Time
        TYER: moment(track_data.added_at).format('YYYY'), // Year
        APIC: cover
    };

    const success = NodeID3.write(tags, file);
}

function isVideo(el) {
    return el.type.toString() === 'video';
}

async function getTrackURL(track_name, track_artist) {
    const searchResults = await ytsr(`${track_name} ${track_artist}`, {pages: 1});

    const videos = searchResults.items.filter(isVideo);

    return videos[0].url;
}

function ffmpegSaveSync(track_url, track_data, save_dir) {
    spinners.update('track', { text: colors.primary.italic(`Downloading '${track_data.title}'..`), spinnerColor: 'cyan' });
    return new Promise((resolve, reject) => {
        const filename = `${track_data.title} - ${track_data.artist}.mp3`.toString().replace(/["<>:/\\|?*]/g, '');
        const filepath = `${save_dir}/${filename}`;

        console.log(track_data.title + ' - ' + track_data.artist + '\n');

        const stream = ytdl(track_url, {
            quality: 'highestaudio'
        });
        const proc = new ffmpeg({source: stream});
        proc.save(filepath);
        proc.on('end', async (err) => {
            if (err) {spinners.stopAll(); reject(console.log(colors.err(err.message)));}

            await setID3Tags(filepath, track_data);
            resolve();
        });
    });
}

async function downloadPlaylist(json_file, options) {
    console.log('\n');
    spinners.add('track', { text: colors.primary.italic('Processing file..'), color: 'cyan' });

    if (!json_file || !fs.existsSync(json_file)) {
        spinners.stopAll();
        return console.log(colors.err('→ You must specify a valid json file'));
    }

    const jsonPlaylistData = JSON.parse(fs.readFileSync(json_file, 'utf-8'));

    if (!jsonPlaylistData.sign || jsonPlaylistData.sign !== 'SPEAD_PLAYLIST') {
        spinners.stopAll();
        return console.log(colors.err('→ You must specify a valid json file'));
    }

    const tracks = jsonPlaylistData.tracks;
    var downloaded_n = 0;

    if (!isNaN(jsonPlaylistData.downloaded_n) && jsonPlaylistData.downloaded_n > 0) {
        downloaded_n = jsonPlaylistData.downloaded_n;
    }

    const dirname = options.name ? options.name : jsonPlaylistData.name;
    var dirlocation = options.out;

    if (process.platform === 'win32' && dirlocation.startsWith('~/'))
        dirlocation = dirlocation.replace('~/', `${require('os').homedir()}/`);
    
    if (fs.existsSync(dirlocation) && fs.lstatSync(dirlocation).isDirectory()) {
        // put a "/" at the end of the path
        if (!dirlocation.endsWith('/') && !dirlocation.endsWith('\\')) dirlocation = dirlocation + '/';
        
        if (!fs.existsSync(dirlocation + dirname)) {
            fs.mkdirSync(dirlocation + dirname);
        }
    } else {
        spinners.stopAll();
        return console.log(colors.err('→ ') + colors.err.dim(dirlocation) + colors.err(' is not a directory.'));
    }

    var i = downloaded_n;
    spinners.add('total', { text: colors.secondary.italic(`0% | Downloading tracks [0/${jsonPlaylistData.tracks_n}]..`), spinnerColor: 'blueBright' });

    for (i; i < jsonPlaylistData.tracks_n; i++) {
        spinners.update('total', { text: colors.secondary.italic(`${Math.floor((i)*100/jsonPlaylistData.tracks_n)}% | Downloading tracks [${i+1}/${jsonPlaylistData.tracks_n}]..`), spinnerColor: 'blueBright' });
        
        const track_url = await getTrackURL(tracks[i].title, tracks[i].artist);
        await ffmpegSaveSync(track_url, tracks[i], dirlocation + dirname);

        downloaded_n = i+1;
    }

    spinners.stopAll();
    console.log(colors.success.bold('→ Success!\n'));
    console.log(' ┌ ' + colors.primary(i) + ' tracks downloaded from ' + colors.primary(jsonPlaylistData.name) + ' to:\n └ ' + colors.grey.bold.underline(dirlocation + dirname + '/') + '\n\n');
    
    fs.renameSync(json_file, dirlocation + dirname + '/' + dirname + '.json');

    utils.setDownloadedNumber(jsonPlaylistData, downloaded_n, dirlocation + dirname + '/' + dirname + '.json');
}

module.exports = downloadPlaylist;