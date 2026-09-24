# TEP monitoring retrospective data

`tep-monitor.json` is the unchanged JSON object extracted from the `script#tep-data` element of the owner's supplied `tep-ccca-monitor.html`, dated September 24, 2026. It contains precomputed retrospective results, not a recomputation performed by this website.

Source HTML SHA-256: `7fcd7d66b961d45ebda6790bedb66f1943ad4279ff06f70ce767c63c5d8856ae`.

JSON SHA-256: `8eec760a599268f411df551704dd8f298e15a0db0e6af4589047fe224b75c63e`.

## Scope and attribution

The original USC CHE 599 Spring 2017 Group 7 submission lists Zheng Wang, Zijian Wang, Shanshan Cui and Wen Chen. Its presentation assigns CCA and concurrent CCA to Shanshan Cui and Wen Chen. The assigned disturbances were IDV(3), (5), (9), (13) and (14). The homepage viewer focuses on these five cases plus normal operation, while the source JSON retains all 22 cases for fidelity.

The original group report is preserved, with its complete author list, at `../pdf/tep-che599-group7-2017.pdf`. The retrospective uses different modeling settings; its figures must not be attributed to the original report.

Method: Q. Zhu, Q. Liu and S. J. Qin, *Concurrent Canonical Correlation Analysis Modeling for Quality-Relevant Monitoring*, IFAC-PapersOnLine 49(7), 2016, 1044–1049. https://doi.org/10.1016/j.ifacol.2016.07.340

Benchmark: Tennessee Eastman process; the supplied retrospective identifies the Braatz benchmark data. The course archive contains the original training/testing `.dat` files. No retrospective recomputation script or cross-validation split specification was supplied, so this presentation does not claim independent numerical reproduction.

## Encoding and interpretation

- Three regularization settings: κ = 0, 0.1, 1.
- Each test case contains 960 samples at 3-minute intervals. Index 160 is the disturbance boundary (8 h); indices 160–959 form the 800-sample post-boundary segment.
- `settings[k].faults[f].s` contains `Tc2`, `Ty2`, `Tx2`, `Qx`; `pca[f].s` contains `T2`, `SPE`.
- Every series value encodes `100 × log10(statistic / control limit)`, rounded to an integer. A positive value exceeds the normalized limit. Values close to the boundary can round to zero.
- The interface derives approximate threshold-crossing percentages from the displayed, quantized traces. It does not mix these with the separately rounded `.r` summaries, which can differ slightly.
- The quality-associated summary combines Tc² and Ty² flags. The process summary combines Tx² and Qx flags. These are monitoring indicators, not accuracy scores or causal diagnoses. Qx can contain potentially quality-relevant residuals.
- The supplied HTML's 70%/30%/50% classification heuristic and its stronger causal/noise interpretations are not used in the homepage viewer.

The vector cover plots the supplied κ=0, IDV(14) Tc² and Tx² traces with labeled log-normalized axes and min/max binning. It is an illustrative cover of these results, not a live process display.
