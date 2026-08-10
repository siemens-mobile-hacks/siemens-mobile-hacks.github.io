---
sidebar_position: 3
---

# Fixing Ghidra SRE

:::info
Since around 2019, Ghidra SRE has had a bug that causes `FF FF` in the v5t architecture to be interpreted as the `BL 0xFFE` instruction. 
This causes an infinite loop during auto-analysis.

If you are using the official version of Ghidra, you need to apply the `ARMTHUMBinstructions.sinc` patch to work with Siemens firmware.

In the [patched version of Ghidra](https://github.com/siemens-mobile-hacks/ghidra-patched), this fix is already included.
:::

# Patched version of Ghidra

The [patched version of Ghidra](https://github.com/siemens-mobile-hacks/ghidra-patched) is prepared for reverse engineering Siemens phones and already includes the fix for the false `BL` instruction in ARM5T.

Ready-made archives can be downloaded from the [Releases](https://github.com/siemens-mobile-hacks/ghidra-patched/releases) section.

# Applying the patch

Simply download the required file and replace `Ghidra/Processors/ARM/data/languages/ARMTHUMBinstructions.sinc` in the installed Ghidra SRE.

Download the patched [ARMTHUMBinstructions.sinc](fixes/11.0.2+/ARMTHUMBinstructions.sinc) for versions:
- 11.4
- 11.3.2
- 11.3.1
- 11.3
- 11.2.1
- 11.2
- 11.1.2
- 11.1.1
- 11.1
- 11.0.3
- 11.0.2

Download the patched [ARMTHUMBinstructions.sinc](fixes/10.3+/ARMTHUMBinstructions.sinc) for versions:
- 11.0.1
- 11.0
- 10.4
- 10.3.3
- 10.3.2
- 10.3.1
- 10.3

# How to port this fix to future versions

You need to disable the old handlers for individual halves of Thumb-1 `BL`/`BLX` only for ARM5T. Full 32-bit instructions will continue to be recognized, and ARM4T behavior will remain unchanged:

```diff
diff --git a/Ghidra/Processors/ARM/data/languages/ARMTHUMBinstructions.sinc b/Ghidra/Processors/ARM/data/languages/ARMTHUMBinstructions.sinc
index 1f6b9f8c..c1eef2e7 100644
--- a/Ghidra/Processors/ARM/data/languages/ARMTHUMBinstructions.sinc
+++ b/Ghidra/Processors/ARM/data/languages/ARMTHUMBinstructions.sinc
@@ -1490,6 +1490,7 @@ macro th_set_carry_for_asr(op1,shift_count) {
 }

 @ifndef VERSION_6T2
+@ifndef VERSION_5

 :bl^ItCond "#"^off		is TMode=1 & ItCond & op11=0x1e & soffset11 [ off = inst_start + 4 + (soffset11 << 12); ]
 {
@@ -1533,7 +1534,8 @@ macro th_set_carry_for_asr(op1,shift_count) {
   call [dest];
 }

-@endif
+@endif # VERSION_5
+@endif # VERSION_6T2

 :bl^ItCond 	ThAddr24 			is TMode=1 & CALLoverride=1 & ItCond & (op11=0x1e; part2c1415=3 & part2c1212=1) & ThAddr24
 {
```