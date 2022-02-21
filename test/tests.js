import {createHash} from 'crypto'
import {existsSync, readdirSync} from 'fs'
import {extname} from 'path'
import {expect} from 'chai'

import {cuecat, equcat, getInfoAndChunks} from "../cuecat.mjs"

const testDir = "./test/CR78"
const stereoFile = "./test/stereo.wav"
const cueHash = "9228fc19a3cec3518a177d31bc0d8c74"
const eqeHash = "5219058d4a0d1dc4e9cf8f51acde5035"

let files

describe("when testDir exists", function() {
    before(function() {
        if (existsSync(testDir)) {
            files = readdirSync(testDir)
                .filter(f => extname(f).toLowerCase() === ".wav")
                .map(f => `${testDir}/${f}`)
        } else {
            this.skip()
        }
    })

    describe("cuecat", function() {
        it("should not change output unexpectedly", function() {
            const wav = cuecat(files)
            const hash = createHash('md5')
                .update(wav.toBuffer()).digest("hex")
            expect(hash).to.equal(cueHash)
            expect(wav.bitDepth).to.equal('16')
            expect(wav.fmt.numChannels).to.equal(1)
            expect(wav.fmt.sampleRate).to.equal(44100)
            expect(wav.cue.dwCuePoints).to.equal(16)
        })
    });

    describe("equcat", function() {
        it("should not change output unexpectedly", function() {
            const wav = equcat([...files, stereoFile])
            const hash = createHash('md5')
                .update(wav.toBuffer()).digest("hex")
            expect(hash).to.equal(eqeHash)
            expect(wav.bitDepth).to.equal('16')
            expect(wav.fmt.numChannels).to.equal(2)
            expect(wav.fmt.sampleRate).to.equal(44100)
            expect(wav.cue.dwCuePoints).to.equal(0)
        })
    });

    describe("getInfoAndChunks", function() {
        it("should calculate max and get chunks", function() {
            const {
                maxChannels,
                maxSamples,
                sumSamples,
                chunks,
            } = getInfoAndChunks(files, '16', 44100.0)
            expect(maxChannels).to.equal(1)
            expect(maxSamples).to.equal(27082)
            expect(sumSamples).to.equal(219311)
            expect(chunks).to.have.length(16)
        })
        it("should be stereo if any file is stereo", function() {
            const {
                maxChannels,
                maxSamples,
                sumSamples,
                chunks
            } = getInfoAndChunks([...files, stereoFile], '16', 44100.0)
            expect(maxChannels).to.equal(2)
            expect(maxSamples).to.equal(123070)
            expect(sumSamples).to.equal(342381)
            expect(chunks).to.have.length(17)
        })
    })
})
