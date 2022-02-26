#!/usr/bin/env python

import os
import sys
import wave

from collections import Counter


def check_path_length(stats, path):
    path_len = len(path)
    if path_len > 127:
        stats['bad'] += 1
        print('error', 'path is {} chars: {}'.format(len(path), path))
    stats['max_path'] = path if len(path) > len(stats['max_path']) else stats['max_path']
    return stats


def check_wav_file(stats, path):
    try:
        with wave.open(path) as wav:
            sample_rate = wav.getframerate()
            channels = wav.getnchannels()
            sample_width = wav.getsampwidth()
    except Exception as ex:
        stats['bad'] += 1
        stats['errs'].add(str(ex))
        print('error', ex, path)
    else:
        stats['channels'][channels] += 1
        stats['sample_rates'][sample_rate] += 1
        stats['sample_widths'][sample_width * 8] += 1
        if sample_width > 3:
            stats['bad'] += 1
            print('error', 'sample width is {}'.format(sample_width), path)
    return stats

def junk_report(junk):
    for j in junk:
        if j.endswith('.DS_Store'):
            continue
        if 'Thumbs.db' in j:
            continue
        f, ext = os.path.splitext(j)
        if ext.lower() in ['.txt', '.jpg', '.gif']:
            continue
        print(j)

stats = {
    'bad': 0,
    'max_path': '',
    'count': 0,
    'junk': 0,
    'hidden': 0,
    'channels': Counter(),
    'sample_rates': Counter(),
    'sample_widths': Counter(),
    'errs': set(),
}
junk = []
hidden = []

for root, dirs, files in os.walk(' '.join(sys.argv[1:])):
    for file in files:
        path = '{}/{}'.format(root, file)
        if file.startswith('.'):
            stats['hidden'] += 1
            hidden.append(path)
            continue
        if not path.lower().endswith('.wav'):
            stats['junk'] += 1
            junk.append(path)
            continue
        stats['count'] += 1

        stats = check_path_length(stats, path)
        stats = check_wav_file(stats, path)

stats['max_path_len'] = len(stats['max_path'])
stats['channels'] = dict(stats['channels'])
stats['sample_rates'] = dict(stats['sample_rates'])
stats['sample_widths'] = dict(stats['sample_widths'])
stats['good'] = stats['count'] - stats['bad']

for k, v in sorted(stats.items()):
    print('{0:>15}: {1}'.format(k, v))

# junk_report(junk)
