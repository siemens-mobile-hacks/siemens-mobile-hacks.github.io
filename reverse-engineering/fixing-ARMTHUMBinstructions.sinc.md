[← Back to the index](./index.md)

# Fixing the latest versions of Ghidra SRE

Since about 2019 there has been a bug in Ghidra SRE where `FF FF` is treated as an `BL 0xFFE` instruction in v5t architecture. This causes an infinity loop in auto-analysis.

You **should** apply patch `ARMTHUMBinstructions.sinc` if you want to work with Siemens firmwares.

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

# How to port this fix to future versions
You need to do something like that:
```diff
--- ARMTHUMBinstructions.sinc
+++ ARMTHUMBinstructions.sinc
@@ -1479,52 +1479,6 @@
   call ThAddr24;
 }
 
-@ifndef VERSION_6T2
-
-:bl^ItCond "#"^off             is TMode=1 & ItCond & op11=0x1e & soffset11 [ off = inst_start + 4 + (soffset11 << 12); ]
-{
-  build ItCond;
-  lr = off:4;
-}
-
-:bl^ItCond "#"^off             is TMode=1 & ItCond & op11=0x1f & offset11 [ off = offset11 << 1; ]
-{
-  build ItCond;
-  local dest = lr + off:4;
-  lr = inst_next|1;
-  SetThumbMode(1);
-  call [dest];
-}
-
-:bl^ItCond lr                  is TMode=1 & ItCond & op11=0x1f & offset11=0 & lr
-{
-  build ItCond;
-  local dest = lr;
-  lr = inst_next|1;
-  SetThumbMode(1);
-  call [dest];
-}
-
-:blx^ItCond "#"^off    is TMode=1 & ItCond & op11=0x1d & offset11 & thc0000=0 [ off = offset11 << 1; ]
-{
-  build ItCond;
-  local dest = (lr & (~0x3)) + off:4;
-  lr = inst_next|1;
-  SetThumbMode(0);
-  call [dest];
-}
-
-:blx^ItCond lr                 is TMode=1 & ItCond & op11=0x1d & offset11=0 & thc0000=0 & lr
-{
-  build ItCond;
-  local dest = (lr & (~0x3));
-  lr = inst_next|1;
-  SetThumbMode(0);
-  call [dest];
-}
-
-@endif
-
```
