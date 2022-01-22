#!/usr/bin/env node

const fs = require('fs')
const wavefile = require('wavefile')

const cuecat = (files, bitDepth='16', sampleRate=44100.0) => {
    // concatenate wav files and put a cue point at each boundary

    let numSamples = 0
    let offset = 0

    const chunks = files.map(file => {
        const wav = new wavefile.WaveFile(fs.readFileSync(file))
        wav.toBitDepth(bitDepth)
        wav.toSampleRate(sampleRate)
        const samples = wav.getSamples(false)
        const chunk = wav.fmt.numChannels == 2 ? [samples[0], samples[1]] : [samples, samples]
        numSamples += chunk[0].length
        return chunk
    })

    const samples = chunks.reduce((samples, chunk) => {
        samples[0].set(chunk[0], offset)
        samples[1].set(chunk[1], offset)
        offset += chunk[0].length
        return samples
    }, [new Float64Array(numSamples), new Float64Array(numSamples)])

    const wav = new wavefile.WaveFile()
    wav.fromScratch(2, sampleRate, bitDepth, [samples[0], samples[1]])

    // set cue points (not regions)
    offset = 0
    chunks.forEach(chunk => {
        if (offset > 0) {
            wav.setCuePoint({position: offset / sampleRate * 1000}) // milliseconds
        }
        offset += chunk[0].length
    })
    return wav
}

if (require.main === module) {
    const args = process.argv.slice(2)
    if (args.length == 1) {
        const wav = new wavefile.WaveFile(fs.readFileSync(args[0]))
        console.log(wav.listCuePoints())
        process.exit(0)
    }

    if (args.length < 3) {
        console.log('cuecat.js <at least two input files...> <output file>')
        console.log('cuecat.js <input file> (list cue points)')
        process.exit(1)
    }

    const outFile = args.pop()

    console.log(args, `=> ${outFile} (${args.length} slices)`)

    if (fs.existsSync(outFile)) {
        console.log('output file already exists')
        process.exit(1)
    }

    fs.writeFileSync(outFile, cuecat(args).toBuffer())
}

module.exports = cuecat
