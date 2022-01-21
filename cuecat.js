#!/usr/bin/env node
// concatenate wav files and put a cue point at each boundary
// targeted for use with the dirtywave M8

const bitDepth = '16'
const sampleRate = 44100.0

var fs = require('fs')
var wavefile = require('wavefile')

const args = process.argv.slice(2)
if (args.length == 1) {
    let wav = new wavefile.WaveFile(fs.readFileSync(args[0]))
    console.log(wav.listCuePoints())
    process.exit(0)
}

if (args.length < 3) {
    console.log('cuecat.js <at least two input files...> <output file>')
    console.log('cuecat.js <input file> (list cue points)')
    process.exit(1)
}

const outFile = args.pop()

console.log(args, '=>', outFile)

if (fs.existsSync(outFile)) {
    console.log('output file already exists')
    process.exit(1)
}

let chunks = []
let offset = 0
args.forEach(function(file) {
    let wav = new wavefile.WaveFile(fs.readFileSync(file))
    wav.toBitDepth(bitDepth)
    wav.toSampleRate(sampleRate)
    let samples = wav.getSamples(false)
    let chunk = wav.fmt.numChannels == 2 ? [samples[0], samples[1]] : [samples, samples]
    chunks.push(chunk)
    offset += chunk[0].length
})

let samples = [new Float64Array(offset), new Float64Array(offset)]
offset = 0
chunks.forEach(function(chunk) {
    samples[0].set(chunk[0], offset)
    samples[1].set(chunk[1], offset)
    offset += chunk[0].length
})

let wav = new wavefile.WaveFile()
wav.fromScratch(2, sampleRate, bitDepth, [samples[0], samples[1]])

// set cue points (not regions)
offset = 0
chunks.forEach(function(chunk) {
    if (offset > 0) {
        wav.setCuePoint({position: offset / sampleRate * 1000}) // milliseconds
    }
    offset += chunk[0].length
})

fs.writeFileSync(outFile, wav.toBuffer())
