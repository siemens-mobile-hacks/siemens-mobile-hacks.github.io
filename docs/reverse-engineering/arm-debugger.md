---
sidebar_position: 2
---

# ArmDebugger

**ArmDebugger** — мощный отладчик для телефонов Siemens от Chaos.

* [ArmDebugger 0.7.9 M2.rar](https://web.archive.org/web/20160806055159/http://forum.allsiemens.com/files/armd-0.7.9m2_296.rar) — последняя версия от Dimadze с фиксами ELKA/NSG.
* [Тема на форуме forum.allsiemens.com](https://web.archive.org/web/20160806060433/http://forum.allsiemens.com/viewtopic.php?t=20735)

Для получения дополнительной информации читайте `README.txt` в архиве или обсуждение на форуме.

# Патч CGSN

Для использования отладчика необходимо установить специальный патч под названием **CGSN Patch**. 
Этот патч реализует специальный протокол для работы отладчика через serial-порт.
Патч можно автоматически сгенерировать с помощью ArmDebugger.

Следуйте этим шагам:

1. Запустите `ArmDebugger.exe`
2. Откройте `Tools -> Generate CGSN Patch`
3. Выберите ваш `fullflash.bin`
4. Примените полученный патч с помощью **V-Klay**

# Примеры конфигураций

Если ваш телефон ещё не определён в `devices.ini`, нужно создать собственную секцию конфига.

Обычно это делается копированием секции для аналогичной модели и заменой **MallocAddress** на правильный адрес функции `malloc()`.

### Пример для NSG/ELKA

EL71, E71, M72 (proto), CL61 (proto), C0F1 (proto), C81, M81, S68

Необходимо заменить:

* `SIEMENS:C81:51` — на вашу модель и версию прошивки
* `Siemens C81 fw51` — на вашу модель и версию прошивки
* `MallocAddress = 0xA0094B5C` — на правильный адрес `malloc()`

```ini
[SIEMENS:C81:51]
Name = Siemens C81 fw51

BootROMaddress = 0x400000;
BootROMsize = 0x100000;

FlashAddress = 0xa0000000;
FlashSize = 0x04000000;

IntRAM1address = 0x0;
IntRAM1size = 0x4000;

IntRAM2address = 0x80000;
IntRAM2size = 0x18000;

ExtRAMaddress = 0xa8000000;
ExtRAMsize = 0x01000000;

VMalloc1address=0xaA000000
VMalloc1size=0x01000000
VMalloc2address=0xaB000000
VMalloc2size=0x01000000
VMalloc3address=0xaC000000
VMalloc3size=0x01000000
VMalloc4address=0xaD000000
VMalloc4size=0x01000000

MiscSpaceaddress=0xc0000000
MiscSpacesize=0x00100000

IOaddress = 0xf0000000
IOsize = 0x10000000

UseRAM = 0x89000

MallocAddress = 0xA0094B5C ; CHANGE THIS
MallocPages = 100
```

### Пример для старого NSG

S75, SL75

Необходимо заменить:

* `SIEMENS:S75:52` — на вашу модель и версию прошивки
* `Siemens S75 fw52` — на вашу модель и версию прошивки
* `MallocAddress = 0xA0094B5C` — на правильный адрес `malloc()`
* `FlashSize = 0x04000000` — на нужный размер FLASH (например, `0x6000000` для SL75)

```ini
[SIEMENS:S75:52]
Name = Siemens S75 fw52

BootROMaddress = 0x400000
BootROMsize = 0x100000

FlashAddress = 0xa0000000
FlashSize = 0x04000000

IntRAM1address = 0x0
IntRAM1size = 0x4000

IntRAM2address = 0x80000
IntRAM2size = 0x18000

ExtRAMaddress = 0xa8000000
ExtRAMsize = 0x01000000

IOaddress = 0xf0000000
IOsize = 0x10000000

UseRAM = 0x89000

MallocAddress = 0xA0094B5C ; CHANGE THIS
MallocPages = 300
```

### Пример для SG

S75, SL75, CX75, M75, SK65, CX70, C65, CX65, M65, S65, SL65, ME75, CF75, C75, C72

Необходимо заменить:

* `SIEMENS:C75:22` — на вашу модель и версию прошивки
* `Siemens C75 fw22` — на вашу модель и версию прошивки
* `MallocAddress = 0xA0203C24` — на правильный адрес `malloc()`
* `FlashSize = 0x2000000` — на нужный размер FLASH (например, `0x4000000` для SK65)
* `ExtRAMsize = 0x800000` — на нужный размер RAM (например, `0x1000000` для SK65 или CX75)

```ini
[SIEMENS:C75:22] 
Name = Siemens C75 fw22 

BootROMaddress = 0x400000
BootROMsize = 0x400000

FlashAddress = 0xa0000000
FlashSize = 0x2000000

IntRAM1address = 0x0
IntRAM1size = 0x18000

IntRAM2address = 0x80000
IntRAM2size = 0x18000

ExtRAMaddress = 0xa8400000
ExtRAMsize = 0x800000

IOaddress = 0xf0000000; 
IOsize = 0x10000000; 

UseRAM = 0x8e004; 

MallocAddress=0xA0203C24 ; CHANGE THIS
MallocPages = 50
```
