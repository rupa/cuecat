#!/usr/bin/env node

import {existsSync, readFileSync, writeFileSync} from 'fs';
import wavefile from "wavefile"

export const getInfoAndChunks = (files, bitDepth, sampleRate) => {
    return files.reduce((acc, file) => {
        const wav = new wavefile.WaveFile(readFileSync(file))
        wav.toBitDepth(bitDepth)
        wav.toSampleRate(sampleRate)
        const samples = wav.getSamples(false)
        const chunk = wav.fmt.numChannels == 2 ? [samples[0], samples[1]] : [samples, samples]
        return {
            maxChannels: Math.max(acc.maxChannels, wav.fmt.numChannels),
            maxSamples: Math.max(acc.maxSamples, chunk[0].length),
            sumSamples: acc.sumSamples += chunk[0].length,
            chunks: [...acc.chunks, chunk],
        }
    }, {maxChannels: 0, maxSamples: 0, sumSamples: 0, chunks:[]})
}

const buildWav = (numChannels, bitDepth, sampleRate, chunks, sampleSize, equalSize=false) => {
    let offset = 0
    const samples = chunks.reduce((samples, chunk) => {
        samples[0].set(chunk[0], offset)
        if(numChannels > 1 ){
          samples[1].set(chunk[1], offset)
        }
        offset += equalSize ? sampleSize / chunks.length : chunk[0].length
        return samples
    }, [new Float64Array(sampleSize), new Float64Array(sampleSize)])
    const wav = new wavefile.WaveFile()
    wav.fromScratch(
        numChannels,
        sampleRate,
        bitDepth,
        numChannels == 1 ? [samples[0]] : [samples[0], samples[1]]
    )
    return wav
}

export const cuecat = (files, bitDepth='16', sampleRate=44100.0) => {
    // concatenate wav files and put a cue point at each boundary
    const {
        maxChannels,
        maxSamples,
        sumSamples,
        chunks,
    } = getInfoAndChunks(files, bitDepth, sampleRate)

    const wav = buildWav(maxChannels, bitDepth, sampleRate, chunks, sumSamples, false)

    // set cue points (not regions)
    chunks.reduce((offset, chunk) => {
        wav.setCuePoint({position: offset / sampleRate * 1000}) // milliseconds
        return offset + chunk[0].length
    }, 0)

    return wav
}

export const equcat = (files, bitDepth='16', sampleRate=44100.0) => {
    // concatenate wav files into even length chunks
    const {
        maxChannels,
        maxSamples,
        sumSamples,
        chunks,
    } = getInfoAndChunks(files, bitDepth, sampleRate)
    return buildWav(maxChannels, bitDepth, sampleRate, chunks, maxSamples * files.length, true)
}

if (import.meta.url === `file://${process.argv[1]}`) {
    let equalSize = false

    const args = process.argv.slice(2)
    if (args[0] === '-e') {
        args.shift()
        equalSize = true
    }
    if (args.length == 1) {
        const wav = new wavefile.WaveFile(readFileSync(args[0]))
        console.log(wav.listCuePoints())
        process.exit(0)
    }
    if (args.length < 3) {
        console.log('cuecat.mjs [-e] <at least two input files...> <output file>')
        console.log('cuecat.mjs <input file> (list cue points)')
        process.exit(1)
    }
    const outFile = args.pop()

    console.log(args, `=> ${outFile} (${args.length}${equalSize ? " equal" : ""} slices)`)
    if (existsSync(outFile)) {
        console.log('output file already exists')
        process.exit(1)
    }

    writeFileSync(outFile, (equalSize ? equcat : cuecat)(args).toBuffer())

}
