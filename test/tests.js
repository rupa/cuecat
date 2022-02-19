const crypto = require('crypto')
const fs = require("fs");
const path = require("path");
const {expect} = require("chai");

const {cuecat, getInfoAndChunks} = require("../cuecat");

const testDir = "./test/CR78"
const files = fs.readdirSync(testDir)
    .filter(f => path.extname(f).toLowerCase() === ".wav")
    .map(f => `${testDir}/${f}`)

describe("cuecat", () => {
    it("should not change output unexpectedly", () => {
        const wav = cuecat(files)
        const hash = crypto.createHash('md5')
            .update(wav.toBuffer()).digest("hex")
        expect(hash).to.equal("9228fc19a3cec3518a177d31bc0d8c74")
    })
});

describe("getInfoAndChunks", () => {
    it("should calculate max and get chunks", () => {
        const {
            maxChannels,
            maxSamples,
            totalSamples,
            chunks,
        } = getInfoAndChunks(files, '16', 44100.0)
        expect(maxChannels).to.equal(1)
        expect(maxSamples).to.equal(27082)
        expect(totalSamples).to.equal(219311)
        expect(chunks).to.have.length(16)
    })
})
