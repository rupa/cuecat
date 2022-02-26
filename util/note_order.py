#!/usr/bin/env python
"""
given a list of filenames with numsical information such as C2 or Bb4 in the
name, attempt to order that list chromatically
"""
import logging
import re

log = logging.getLogger(__name__)

notes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
note_ord = {x: i for i, x in enumerate(notes)}
for enharm in (
    ('C#', 'Db'),
    ('D#', 'Eb'),
    ('F#', 'Gb'),
    ('G#', 'Ab'),
    ('A#', 'Bb'),
    ('c', 'C'),
    ('d', 'D'),
    ('e', 'E'),
    ('f', 'F'),
    ('g', 'G'),
    ('a', 'A'),
    ('b', 'B'),
    ('f#', 'Gb'),
    ('c#', 'Db'),
    ('d#', 'Eb'),
    ('g#', 'Ab'),
    ('a#', 'Bb'),
):
    note_ord[enharm[0]] = note_ord[enharm[1]]

matcher = re.compile(r'([A-Ga-g]#?b?)(-?[0-9])')


def to_mapped(names):
    for name in names:
        try:
            octave, note = matcher.search(name).group(2, 1)
        except AttributeError:
            log.warning("no match: {}".format(name))
            continue
        yield (int(octave), note_ord[note]), name


def to_ordered(names):
    mapped = {k: v for k, v in to_mapped(names)}
    return [v for _, v in sorted(mapped.items())]


if __name__ == '__main__':
    import os
    import sys

    args = sys.argv[1:]
    if not args:
        sys.exit()

    if args[0] == '-l':
        args = args[1:]
        l = True
    else:
        l = False

    res = to_ordered(os.listdir(' '.join(args)))

    if l:
        for x in res:
            print(x)
    else:
        print(' '.join(res))
