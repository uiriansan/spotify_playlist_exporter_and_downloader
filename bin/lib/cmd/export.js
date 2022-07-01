require('dotenv').config({ path: __dirname + '\\..\\..\\..\\.env' });
const fs = require('fs');
const path = require('path');
const SpotifyWebApi = require('spotify-web-api-node');
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
});
const Spinnies = require('spinnies');
const spinners = new Spinnies({ spinnerColor: 'cyan' });
console.log('\n');

const utils = require('../utils.js');

async function getTracks(playlist_id, limit, offset) {
    return new Promise((resolve, reject) => {
        try {
            spotifyApi.getPlaylistTracks(playlist_id, {limit: limit, offset: offset})
            .then((data) => {
                resolve(data.body.items);
            },
            (err) => {
                spinners.stopAll();;
                utils.clearLines(1);
                console.log(colors.err(err.message))
            });
        } catch (err) {
            spinners.stopAll();;
            utils.clearLines(1);
            console.log(colors.err(err.message));
        }
    });
}

function preparePlaylist(playlist, playlistInfo) {
    var playlistString = '';
    const jso = {
        sign: 'SPEAD_PLAYLIST',
        name: playlistInfo.name,
        url: playlistInfo.url,
        image: playlistInfo.image,
        author: playlistInfo.author,
        tracks_n: playlistInfo.tracks_n,
        tracks: [...utils.clearPlaylistData(playlist)]
        // tracks: [...playlist]
    };
    playlistString = JSON.stringify(jso, null, '\t');
    return playlistString;
}

function getPlaylist(playlist_id, export_path, filename) {
    spinners.add('proc', { text: colors.primary.italic('Checking if playlist exists..'), color: 'cyan' });
    var playlist = [], playlistInfo = [];
    const limit = 100;

    try {
        spotifyApi.getPlaylist(playlist_id, {limit: limit})
        .then(async (data) => {
            playlistInfo['name'] = data.body.name;
            playlistInfo['url'] = data.body.external_urls.spotify;
            playlistInfo['image'] = data.body.images[0].url
            playlistInfo['author'] = data.body.owner.external_urls.spotify;
            playlistInfo['tracks_n'] = data.body.tracks.total;

            // Push first 100 tracks to playlist
            playlist.push(...data.body.tracks.items);

            // push remaining tracks...
            const totalTracks = data.body.tracks.total;
            const numRequests = Math.floor(totalTracks / limit) + 1;

            spinners.update('proc', { text: colors.primary.italic('0% | Requesting tracks..')  });
            for (let req = 1; req < numRequests; req++) {
                spinners.update('proc', { text: colors.primary.italic(`%s ${Math.floor((req+1)*100/numRequests)}% | Requesting tracks..`) });
                const tracks = await getTracks(playlist_id, limit, req * limit);
                playlist.push(...tracks);
            }
            
            spinners.update('proc', { text: colors.primary.italic('Creating file..') });

            if (filename != null) {
                if (!filename.endsWith('.json')) {
                    filename = filename + '.json'
                }
            } else {
                filename = playlistInfo.name + '.json';
            }
            const final_path = export_path + filename;
            const cleanPlaylist = preparePlaylist(playlist, playlistInfo);

            fs.writeFile(final_path, cleanPlaylist, 'utf-8', (err) =>{
                spinners.stopAll();
                console.clear();

                if (err) {
                    console.log(colors.api_err(err.message));
                }
                const npath = final_path.replace(/\\/g, '/');
                console.log(colors.success.bold('→ Success!\n'));
                console.log(' ┌ ' + colors.primary(playlistInfo.tracks_n) + ' tracks exported from ' + colors.primary(playlistInfo.name) + ' to:\n └ ' + colors.grey.bold.underline(npath) + '\n\n')
            });

            spinners.stopAll();;
        },
        (err) => {
            spinners.stopAll();;
            utils.clearLines(1);
            if (err.statusCode == 404) {
                console.log(colors.err('→ You must provide a valid ID!'));
            } else {
                console.log(colors.api_err(err.message));
            }
        });
    } catch(e) {}
}


function exportPlaylist(str, options) {
    spinners.update('proc', { text: colors.primary.italic('Verifying credentials..')});

    // Spotify API returns an error if receives some special characters
    const rgx = /^[a-zA-Z0-9]*$/; // Allow only A-Z, a-z and 0-9 characters
        
    if (str && rgx.test(str)) {
        spotifyApi.clientCredentialsGrant().then((data) => {
            spotifyApi.setAccessToken(data.body['access_token']);
            
            var export_path = options.out;
            // Allow "~/" shotcut for homedir
            if (process.platform === 'win32' && export_path.startsWith('~/'))
                export_path = export_path.replace('~/', `${require('os').homedir()}/`);

            // Relative paths, etc
            export_path = path.resolve(export_path);
            
            // Check if path is a valid dir
            if (fs.existsSync(export_path) && fs.lstatSync(export_path).isDirectory()) {
                // put a "/" at the end of the path
                if (!export_path.endsWith('/') && !export_path.endsWith('\\')) export_path = export_path + '/';
                
                const filename = options.name || null
                getPlaylist(str, export_path, filename);
            } else {
                spinners.stopAll();;
                utils.clearLines(1);
                console.log(colors.err('→ ') + colors.err.dim(export_path) + colors.err(' is not a directory.'))
            }
        },
        (err) => {
            spinners.stopAll();;
            utils.clearLines(1);
            console.log(colors.api_err(err.message))
        });
    } else {
        spinners.stopAll();;
        utils.clearLines(1);
        console.log(colors.err('→ You must provide a valid ID!'));
    }
}

module.exports = exportPlaylist;