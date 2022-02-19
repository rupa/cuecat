const crypto = require('crypto')
const fs = require("fs");
const path = require("path");
const {expect} = require("chai");

const cuecat = require("../cuecat");

describe("cuecat", () => {
    it("should not change output unexpectedly", () => {
        const testDir = "./test/CR78"

        const files = fs.readdirSync(testDir)
            .filter(f => path.extname(f).toLowerCase() === ".wav")
            .map(f => `${testDir}/${f}`)
        const wav = cuecat(files)
        const hash = crypto.createHash('md5')
            .update(wav.toBuffer()).digest("hex")
        expect(hash).to.equal("9228fc19a3cec3518a177d31bc0d8c74")
    })
});
