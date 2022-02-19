#!/usr/bin/env node

const fs = require('fs')
const wavefile = require('wavefile')

const getInfoAndChunks = (files, bitDepth, sampleRate) => {
    return files.reduce((acc, file) => {
        const wav = new wavefile.WaveFile(fs.readFileSync(file))
        wav.toBitDepth(bitDepth)
        wav.toSampleRate(sampleRate)
        const samples = wav.getSamples(false)
        const chunk = wav.fmt.numChannels == 2 ? [samples[0], samples[1]] : [samples, samples]
        return {
            maxChannels: Math.max(acc.maxChannels, wav.fmt.numChannels),
            maxSamples: Math.max(acc.maxSamples, chunk[0].length),
            totalSamples: acc.totalSamples += chunk[0].length,
            chunks: [...acc.chunks, chunk],
        }
    }, {maxChannels: 0, maxSamples: 0, totalSamples: 0, chunks:[]})
}

const cuecat = (files, bitDepth='16', sampleRate=44100.0) => {
    // concatenate wav files and put a cue point at each boundary
    let offset = 0
    const {
        maxChannels,
        maxSamples,
        totalSamples,
        chunks,
    } = getInfoAndChunks(files, bitDepth, sampleRate)

    const samples = chunks.reduce((samples, chunk) => {
        samples[0].set(chunk[0], offset)
        if(maxChannels > 1 ){
          samples[1].set(chunk[1], offset)
        }
        offset += chunk[0].length
        return samples
    }, [new Float64Array(totalSamples), new Float64Array(totalSamples)])
    const wav_samples = maxChannels == 1 ? [samples[0]] : [samples[0], samples[1]]
    const wav = new wavefile.WaveFile()
    wav.fromScratch(maxChannels, sampleRate, bitDepth, wav_samples)

    // set cue points (not regions)
    chunks.reduce((offset, chunk) => {
        wav.setCuePoint({position: offset / sampleRate * 1000}) // milliseconds
        return offset + chunk[0].length
    }, 0)

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

module.exports = {
    cuecat,
    getInfoAndChunks
};
