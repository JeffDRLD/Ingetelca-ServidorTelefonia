const TelegramBot = require("node-telegram-bot-api");

const tokenE = "6751240359:AAEnQO8obrPgzjFy3BkR_Jl_0aybTdtH_Ww";
const tokenJ = "6654183029:AAGBz72wJ1n8xtGFDIq00UVGtT0j57Bgagw";

const juan = false;
const token = juan ? tokenJ : tokenE;

const bot = new TelegramBot(token, { polling: true });

module.exports = bot;
