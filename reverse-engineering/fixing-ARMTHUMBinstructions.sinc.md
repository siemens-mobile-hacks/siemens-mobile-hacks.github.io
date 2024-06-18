[← Back to the index](./index.md)

# Fixing the latest versions of Ghidra SRE

Newer versions (>= v10.2.3) have a bug where `FF FF` is treated as an `BL 0xFFE` instruction.

You can still use last working version v10.2.3 or manually patch `ARMTHUMBinstructions.sinc` in your Ghidra SRE installation.

# Patching

Just download right file and replace `Ghidra/Processors/ARM/data/languages/ARMTHUMBinstructions.sinc` in your Ghidra SRE installation.

Download patched [ARMTHUMBinstructions.sinc](fixes/11.0.2+/ARMTHUMBinstructions.sinc) for versions:
- 11.1.1
- 11.1
- 11.0.3
- 11.0.2

Download patched [ARMTHUMBinstructions.sinc](fixes/10.3+/ARMTHUMBinstructions.sinc) for versions:
- 11.0.1
- 11.0
- 10.4
- 10.3.3
- 10.3.2
- 10.3.1
- 10.3
