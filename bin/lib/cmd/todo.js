const fs = require('fs');
const colors = require('../styles');

module.exports = () => {
    const todos = fs.readFileSync(__dirname + '\\..\\..\\..\\TODO.txt', 'utf-8').toString().split('\n');

    for (i in todos) {
        if (!todos[i].startsWith('--'))
            console.log(colors.yellow.bold(todos[i]));
    }
}