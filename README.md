# Synopsis

`cuecat.js` concatenates WAV files, either with a cue point at each boundary,
or evenly spaced.

Takes mono or stereo WAV input. Output is 16 bit 44.1khz WAV, stereo, or mono
if all inputs are mono.

Targeted for use with the dirtywave M8, which supports up to 32 cue markers in
a WAV, or can evenly slice a WAV in up to 128 slices.

# Setup

* You need `node.js` installed whichever way makes sense for your platform
* Clone this repo
* Run `npm install` in the root of this repo, to pick up dependencies
* Run `./cuecat.js` and see a help message

# Usage

`cuecat.js input1.wav input2.wav ... inputN.wav output.wav` to stitch the input
WAVs together (in order), and set a cue point at the end of each one.

If the first argument is `-e`, the input files will be evenly spaced through
the output, and cue points will not be set.

You can also list the cue points in a WAV: `cuecat.js file.wav`

The utils folder has some extra things:

* `batch.sh` is an example for how I'd run this on a bunch of dirs full of WAV
  files.
* `note_order.py` tries to sort and list musical filenames in chromatic order.
* `process.sh` has some functions for trimming audio files with sox
