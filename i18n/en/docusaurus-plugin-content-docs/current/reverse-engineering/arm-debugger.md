---
sidebar_position: 2
---

# ArmDebugger

**ArmDebugger** — a powerful debugger for Siemens phones by Chaos.

* [ArmDebugger 0.7.9 M2.rar](https://web.archive.org/web/20160806055159/http://forum.allsiemens.com/files/armd-0.7.9m2_296.rar) — the latest version by Dimadze with ELKA/NSG fixes.
* [Thread on forum.allsiemens.com](https://web.archive.org/web/20160806060433/http://forum.allsiemens.com/viewtopic.php?t=20735)

For more information, read the `README.txt` in the archive or the discussion on the forum.

# CGSN Patch

To use the debugger, you need to install a special patch called the **CGSN Patch**. 
This patch implements a special protocol for the debugger to work via the serial port.
The patch can be automatically generated using ArmDebugger.

Follow these steps:

1. Run `ArmDebugger.exe`
2. Open `Tools -> Generate CGSN Patch`
3. Select your `fullflash.bin`
4. Apply the generated patch using **V-Klay**

# Configuration Examples

If your phone is not yet defined in `devices.ini`, you need to create your own config section.

This is usually done by copying the section for a similar model and replacing **MallocAddress** with the correct address of the `malloc()` function.

### Example for NSG/ELKA

EL71, E71, M72 (proto), CL61 (proto), C0F1 (proto), C81, M81, S68

You need to replace:

* `SIEMENS:C81:51` — with your model and firmware version
* `Siemens C81 fw51` — with your model and firmware version
* `MallocAddress = 0xA0094B5C` — with the correct `malloc()` address

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

### Example for old NSG

S75, SL75

You need to replace:

* `SIEMENS:S75:52` — with your model and firmware version
* `Siemens S75 fw52` — with your model and firmware version
* `MallocAddress = 0xA0094B5C` — with the correct `malloc()` address
* `FlashSize = 0x04000000` — with the required FLASH size (e.g., `0x6000000` for SL75)

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

### Example for SG

S75, SL75, CX75, M75, SK65, CX70, C65, CX65, M65, S65, SL65, ME75, CF75, C75, C72

You need to replace:

* `SIEMENS:C75:22` — with your model and firmware version
* `Siemens C75 fw22` — with your model and firmware version
* `MallocAddress = 0xA0203C24` — with the correct `malloc()` address
* `FlashSize = 0x2000000` — with the required FLASH size (e.g., `0x4000000` for SK65)
* `ExtRAMsize = 0x800000` — with the required RAM size (e.g., `0x1000000` for SK65 or CX75)

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