#!/usr/bin/env bash

# takes a list of directories, and outputs a cuecat cmd for each one,
# that would stitch all of the wav files in it, and output a file named directory.wav
# (with / replaced with _). doesn't recurse, tries to handle spaces
#
# so something like:
#   bash batch.sh dir/1 dir/2 ... dir/N > run.sh
# and then:
#   bash run.sh
# and you should have dir_1.wav dir_2.wav, etc

SAVEIFS=$IFS
IFS=$(echo -en "\n\b")

for x in $*; do
  printf "cuecat.js "
  for y in $x/*wav; do printf "\"$y\" "; done
  echo \"${x//\//_}.wav\"
done

IFS=$SAVEIFS