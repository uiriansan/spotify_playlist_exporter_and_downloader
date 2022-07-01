#!/usr/bin/env node

const { Command } = require('commander');
const program = new Command();

program
    .name('spead')
    .description('Export Spotify playlists to .json and download then using youtube-dl and ffmpeg.')
    .version('0.0.1');


// -> Export
program
    .command('export')
    .alias('e')
    .alias('exp')
    .alias('expo')
    .description('receives a Spotify playlist ID and exports it to .json.')
    .argument('<playlist_id>', 'a valid playlist ID from Spotify')
    .option('-o, --out <dir>', 'export dir; default is your current directory', process.cwd())
    .option('-n, --name <filename>', "export name; default is playlist's name")
    .action((str, options) => {
        require('./lib/cmd/export.js')(str, options);
    });

// -> Download
program
    .command('download')
    .alias('d')
    .alias('down')
    .alias('dl')
    .description('receives a .json exported playlist and downloads evey track from Youtube.')
    .argument('<json_file>', 'a valid .json file containing an exported playlist')
    .option('-o, --out <dir>', 'export dir; default is your current directory', process.cwd())
    .option('-n, --name <dirname>', "name of the directory created to store your playlist; default is playlist's name")
    .action((str, options) => {
        require('./lib/cmd/download.js')(str, options);
    });

// -> Set
program
    .command('set')
    .description('set Spotify CLIENT_ID and CLIENT_SECRET')
    .argument('[config]', 'must be "id" or "secret"')
    .argument('<value>', 'your CLIENT_ID or CLIENT_SECRET')
    .action((config, value) => {
        require('./lib/cmd/set.js')(config, value);
    });


program
    .command('todo')
    .action(() => {
        require('./lib/cmd/todo.js')();
    });

program.parse();
