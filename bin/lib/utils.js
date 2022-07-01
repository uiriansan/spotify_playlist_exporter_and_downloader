function clearLines(lines_n) {
    for(let i = 0; i < lines_n; i++) {
        const y = i === 0 ? null : -1;
        process.stdout.moveCursor(0, y);
        process.stdout.clearLine(1);
    }
    process.stdout.cursorTo(0);
}

function clearPlaylistData(playlist) {
    var newPlaylist = [];

    playlist.forEach((t, i) => {
        const track = {
            title: t.track.name,
            artist: t.track.artists[0].name,
            album: t.track.album.name,
            album_cover: t.track.album.album_type !== null ? t.track.album.images[0].url : '',
            added_at: t.added_at,
        };
        newPlaylist.push(track);
    });
    return newPlaylist;
}

function isPathAbsolute(path_t) {
    const path = require('path');
    return path.resolve(path_t) === path.normalize(path_t).replace( RegExp(path.sep+'$'), '' );
}

function getDownloadedTracks(filepath, filename) {
    var downloaded_n = null;

    const fs = require('fs');
    const jso = JSON.parse(fs.readFileSync(filepath+filename, 'utf-8'));

    if (!isNaN(jso.downloaded_n) && jso.downloaded_n > 0) {
        downloaded_n = jso.downloaded_n;
    }

    return downloaded_n;
}

function setDownloadedNumber(playlist_data, downloaded_n, json_file) {
    const fs = require('fs');

    playlist_data.downloaded_n = downloaded_n;

    fs.writeFileSync(json_file, JSON.stringify(playlist_data, null, '\t'), 'utf-8', (err) => {
        if (err) return console.log(err.message);
    });

    process.exit();
}

module.exports = {
    clearLines,
    clearPlaylistData,
    isPathAbsolute,
    getDownloadedTracks,
    setDownloadedNumber
}