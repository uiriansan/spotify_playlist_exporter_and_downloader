const colors = require('../styles.js');
const fs = require('fs');

function setEnv(config, value) {
    if (config.toString() !== 'id' && config.toString() !== 'secret') {
        console.log(colors.err(`→ '${config}' is not a valid config option`))
        return;
    }

    const envDir = __dirname + '\\..\\..\\..\\.env';

    var envFile;
    try {
        envFile = fs.readFileSync(envDir, 'utf-8').toString().split('\n');
    } catch(err) {
        envFile = ['CLIENT_ID=your_id_here', 'CLIENT_SECRET=your_secret_here'];
    }

    const env = {
        id: envFile[0].split('=')[1].trim(),
        secret: envFile[1].split('=')[1].trim()
    };

    if (config.toString() === 'id') {
        env.id = value.toString()
    } else if (config.toString() === 'secret') {
        env.secret = value.toString()
    }

    const envString = `CLIENT_ID=${env.id}\nCLIENT_SECRET=${env.secret}`

    fs.writeFileSync(envDir, envString);
}

module.exports = setEnv;