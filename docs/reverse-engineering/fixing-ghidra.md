---
sidebar_position: 3
---

# Исправление Ghidra SRE

:::info
Примерно с 2019 года в Ghidra SRE существует баг, из-за которого `FF FF` в архитектуре v5t интерпретируется как инструкция `BL 0xFFE`. 
Это вызывает бесконечный цикл при автоанализе.

Если вы используете официальную версию Ghidra, необходимо применить патч `ARMTHUMBinstructions.sinc` для работы с прошивками Siemens.

В [исправленной версии Ghidra](https://github.com/siemens-mobile-hacks/ghidra-patched) это исправление уже включено.
:::

# Исправленная версия Ghidra

[Исправленная версия Ghidra](https://github.com/siemens-mobile-hacks/ghidra-patched) подготовлена для реверс-инжиниринга телефонов Siemens и уже включает исправление ложной инструкции `BL` в ARM5T.

Готовые архивы можно скачать в разделе [Releases](https://github.com/siemens-mobile-hacks/ghidra-patched/releases).

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

Нужно отключить старые обработчики отдельных половин Thumb-1 `BL`/`BLX` только для ARM5T. Полные 32-битные инструкции продолжат распознаваться, а поведение ARM4T не изменится:

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
