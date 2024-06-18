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

# How to port this fix to future versions
You need to do something like that:
```diff
--- ARMTHUMBinstructions.sinc
+++ ARMTHUMBinstructions.sinc
@@ -1455,16 +1455,7 @@ macro th_set_carry_for_asr(op1,shift_count) {
   local dest = lr + off:4;
   lr = inst_next|1;
   SetThumbMode(1);
-  call [dest];
+  goto [dest];
 }
-
-:bl^ItCond lr			is TMode=1 & ItCond & op11=0x1f & offset11=0 & lr
-{
-  build ItCond;
-  local dest = lr;
-  lr = inst_next|1;
-  SetThumbMode(1);
-  call [dest];
-}
 
 :blx^ItCond "#"^off 	is TMode=1 & ItCond & op11=0x1d & offset11 & thc0000=0 [ off = offset11 << 1; ]
@@ -1476,15 +1467,6 @@ macro th_set_carry_for_asr(op1,shift_count) {
   call [dest];
 }
 
-:blx^ItCond lr			is TMode=1 & ItCond & op11=0x1d & offset11=0 & thc0000=0 & lr
-{
-  build ItCond;
-  local dest = (lr & (~0x3));
-  lr = inst_next|1;
-  SetThumbMode(0);
-  call [dest];
-}
-
 @endif
 
 :bl^ItCond 	ThAddr24 			is TMode=1 & CALLoverride=1 & ItCond & (op11=0x1e; part2c1415=3 & part2c1212=1) & ThAddr24
```
