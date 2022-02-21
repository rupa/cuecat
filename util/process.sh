#!/usr/bin/env bash
set -e

# some helpers for audio processing

trim_silence() {
    local threshold_time=0.1
    local threshold_pcnt=0.1%
    # from start
    sox $1 $2 silence 1 $threshold_time $threshold_pcnt
    # from beginning and end
    #sox $1 $2 silence 1 $threshold_time $threshold_pcnt reverse silence 1 0.2 0.1% reverse
}

trim_to_length() {
    # half-second fadeout
    local fadeout=0.5
    sox $1 $2 trim 0 $3 fade t 0 0 $fadeout
}

batch() {
    local cmd=$1
    local indir=$2
    local outdir=$3
    shift 3
    for x in $indir/*; do
        local y=$(basename $x)
        echo $cmd $x $outdir/$y $*
    done
}

# trim silence from the beginning of files in piano,
# and put the result in tmp1
#batch trim_silence piano tmp1

# trim files in tmp1 to fifteen seconds,
# and put the result in tmp2
#batch trim_to_length tmp1 tmp2 00:15
