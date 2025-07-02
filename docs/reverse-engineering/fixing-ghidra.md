---
sidebar_position: 3
---

# Исправление Ghidra SRE

:::info
Примерно с 2019 года в Ghidra SRE существует баг, из-за которого `FF FF` в архитектуре v5t интерпретируется как инструкция `BL 0xFFE`. 
Это вызывает бесконечный цикл при автоанализе.

Вы **обязаны** применить патч `ARMTHUMBinstructions.sinc`, если хотите работать с прошивками Siemens.
:::

# Применение патча

Просто скачайте нужный файл и замените `Ghidra/Processors/ARM/data/languages/ARMTHUMBinstructions.sinc` в установленной Ghidra SRE.

Скачать пропатченный [ARMTHUMBinstructions.sinc](fixes/11.0.2+/ARMTHUMBinstructions.sinc) для версий:
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

Скачать пропатченный [ARMTHUMBinstructions.sinc](fixes/10.3+/ARMTHUMBinstructions.sinc) для версий:
- 11.0.1
- 11.0
- 10.4
- 10.3.3
- 10.3.2
- 10.3.1
- 10.3

# Как портировать это исправление на будущие версии

Нужно сделать примерно следующее:
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
