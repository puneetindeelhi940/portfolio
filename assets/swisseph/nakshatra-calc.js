/*
 * nakshatra-calc.js — Swiss Ephemeris wrapper for Nakshatra Explorer pages.
 * Loads the WASM module and exposes two functions:
 *   getSiderealMoonLongitude(date) → degrees (0–360)
 *   getApproxNakshatraIndex(date) → { index, remainingHours }
 *
 * Usage in HTML:
 *   <script type="module">
 *     import { initSwissEph, getSiderealMoonLongitude, getApproxNakshatraIndex } from './assets/swisseph/nakshatra-calc.js';
 *     await initSwissEph();
 *     const lon = getSiderealMoonLongitude(new Date());
 *   </script>
 */

const BASE_URL = new URL('.', import.meta.url).href;

const SE_MOON = 1;
const SE_GREG_CAL = 1;
const SEFLG_SPEED = 256;
const SEFLG_SIDEREAL = 65536;
const SEFLG_MOSEPH = 4;
const SE_SIDM_LAHIRI = 1;

let wasm = null;
let api = null;
let bufPos = 0;
let bufErr = 0;
let _ready = null;

async function _loadWasm() {
    const mod = await import(BASE_URL + 'swisseph.mjs');
    const factory = mod.default || mod.createSwissEphModule || mod;
    wasm = await factory({
        locateFile: (path) => BASE_URL + path,
        print: () => {},
        printErr: () => {}
    });

    const cwrap = wasm.cwrap.bind(wasm);
    api = {
        julday: cwrap('swe_julday', 'number', ['number','number','number','number','number']),
        calcUt: cwrap('swe_calc_ut', 'number', ['number','number','number','number','number']),
        setSidMode: cwrap('swe_set_sid_mode', null, ['number','number','number']),
        getAyanamsaExUt: cwrap('swe_get_ayanamsa_ex_ut', 'number', ['number','number','number','number']),
    };

    bufPos = wasm._malloc(6 * 8);
    bufErr = wasm._malloc(256);

    api.setSidMode(SE_SIDM_LAHIRI, 0, 0);
}

export async function initSwissEph() {
    if (!_ready) _ready = _loadWasm();
    return _ready;
}

function dateToJD(date) {
    const y = date.getUTCFullYear();
    const m = date.getUTCMonth() + 1;
    const d = date.getUTCDate();
    const h = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
    return api.julday(y, m, d, h, SE_GREG_CAL);
}

export function getSiderealMoonLongitude(date) {
    const jd = dateToJD(date);
    const flags = SEFLG_MOSEPH | SEFLG_SPEED | SEFLG_SIDEREAL;
    wasm.setValue(bufErr, 0, 'i8');
    api.calcUt(jd, SE_MOON, flags, bufPos, bufErr);
    const lon = wasm.getValue(bufPos, 'double');
    return ((lon % 360) + 360) % 360;
}

export function getMoonSpeed(date) {
    const jd = dateToJD(date);
    const flags = SEFLG_MOSEPH | SEFLG_SPEED | SEFLG_SIDEREAL;
    wasm.setValue(bufErr, 0, 'i8');
    api.calcUt(jd, SE_MOON, flags, bufPos, bufErr);
    return wasm.getValue(bufPos + 3 * 8, 'double');
}

export function getAyanamsa(date) {
    const jd = dateToJD(date);
    wasm.setValue(bufErr, 0, 'i8');
    api.getAyanamsaExUt(jd, SEFLG_MOSEPH, bufPos, bufErr);
    return wasm.getValue(bufPos, 'double');
}

export function getApproxNakshatraIndex(date) {
    const lon = getSiderealMoonLongitude(date);
    const nkW = 360 / 27;
    const idx = Math.floor(lon / nkW);
    const pos = (lon % nkW) / nkW;
    const speed = getMoonSpeed(date);
    const rem = nkW * (1 - pos) / Math.abs(speed);
    return { index: idx, remainingHours: Math.max(0, rem) };
}
