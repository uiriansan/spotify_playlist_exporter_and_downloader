const colors = require('ansi-colors');

module.exports = colors.theme({
    primary: colors.cyan,
    secondary: colors.blueBright,
    success: colors.green,
    err: colors.redBright,
    api_err: colors.red,
    warning: colors.yellow,

    bgPrimary: colors.bgBlueBright,
    bgSecondary: colors.bgCyan
});