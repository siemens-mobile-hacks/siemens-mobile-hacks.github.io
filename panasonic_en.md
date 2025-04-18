# Variants
Some Panasonic phones use hardware from Infineon.
Models marked with a check (✓) have internal photos available. The rest are filled in either based on FCCID or intuition.
Model | VS2 | VS3 | VS6 | VS7 ☑ | SA6 | SA7 ☑ | MX6 | MX7
-- | -- | -- | -- | -- | -- | -- | -- | --
Photo | ![VS2](https://github.com/user-attachments/assets/3970d9d2-4997-4ee7-8199-1d242b6392e7) | ![VS3](https://github.com/user-attachments/assets/ea404699-12d5-45ac-88ef-e393aec35ee6) | ![VS6](https://github.com/user-attachments/assets/4d3c0ff2-6613-404c-8da6-b133006e0809) | ![VS7](https://github.com/user-attachments/assets/a80d1aaa-0858-4a81-93bc-562fdc47fcb9) | ![SA6](https://github.com/user-attachments/assets/ff238909-d572-4393-bad6-182b5c3ea40d) | ![SA7](https://github.com/user-attachments/assets/d55911c1-6170-47ae-98e9-cea1379ba54e) | ![MX6](https://github.com/user-attachments/assets/c5c0cb63-464b-491d-8670-4e7391f54367) | ![MX7](https://github.com/user-attachments/assets/8267fd59-19ed-4d77-ba9c-67364800a314)
FCCID |  | NWJ23C002A |   | NWJ26C001A |   |   |   |  
OS | APOXI | APOXI | APOXI | APOXI | APOXI | APOXI | APOXI | APOXI
CPU | PMB8875 | PMB8875 | PMB8875 | PMB8875 | PMB8875 | PMB8875 | PMB8875 | PMB8875
POWER | ? | PMB6812 | ? | PMB6811 | ? | PMB6811 | ? | PMB6811
RF | PMB6270 | PMB6270 | PMB6270 | PMB6270 | PMB6270 | PMB6270 | PMB6270 | PMB6270
PAM | SKY77328 | SKY77328 | SKY77328 | SKY77328 | SKY77328 | SKY77328 | SKY77328 | SKY77328
FLASH+RAM | 64/16: PF38F4460LVYTB0 | 64/16: PF38F4460LVYTB0 | 64/16: PF38F4460LVYTB0 | 64/16: PF38F4460LVYTB0 | 64/16: PF38F4460LVYTB0 | 64/16: PF38F4460LVYTB0 | 64/16: PF38F4460LVYTB0 | 64/16: PF38F4460LVYTB0
Resolution&bit&size | 240x320x24, 2.2" | 240x320x24, 2.2" | 240x320x24, 2.2" | 240x320x24, 2.5" & 96x64x12 | 240x320x24, 2.2" | 240x320x24, 2.5" & 96x64x12 | 240x320x24, 2.2" | 240x320x24, 2.5" & 96x64x12
LCD | ? | ? | ? | ? | ? | ? | ? | ?
GPU | S1D13756 | S1D13756 | S1D13756 | S1D13756 | S1D13756 | S1D13756 | S1D13756 | S1D13756
BT | no | no | PMB8761 | PMB8761 | no | PMB8761 | no | PMB8761
IrDA | yes | yes | yes | yes | yes | yes | yes | yes
Camera | 1.3 MP | 1.3 MP | 2.0 MP | 2.0 MP | 1.3 MP | 2.0 MP | 1.3 MP | 2.0 MP
Macro switch | Outer | Outer | Inner | Inner | Outer | Inner | Outer | Inner
Bat.cap. | 830 mAh | 830 mAh | 830 mAh | 830 mAh | 1660 mAh | 1660 mAh | 1660 mAh | 1660 mAh
Covers | Static | Changeable | Static | Changeable | Static | Static | Changeable | Changeable
Dimensions | 96x46x18.2mm, 98g | 96x46x17.6mm, 102g | 96x46x21mm, 101g | 102x51x18.8mm, 113g | 96x47x25mm, 127g | 102x53x26mm, 140g | 96x46x26mm, 130g | 102x51x26mm, 144g

# Checking FW version
1. Turn on the phone without a SIM card.
2. Quickly enter *#9999#.
3. If nothing happens, the input was not fast enough. Try again.

# Connecting to a PC
Several methods are possible:
1. USB cable – Allows file transfer, PTEST mode, dumping flash memory or RAM contents, and even some patching.
2. UART cable – Used for working with Chaos boot via V_Klay and x65flasher.
3. Theoretically, Bluetooth (if available) and IrDA could work, but we haven’t tested them.

## Phone connector
These phones use an [ARIB C](https://www.arib.or.jp/english/html/overview/doc/STD-T63V13_30/3_T12/ARIB-TR-T12/R99/27/A27A01-330.pdf) connector.

![image](https://github.com/user-attachments/assets/23028c6c-59e3-4a88-bace-2b53dcbf5321)

## UART pinout
Gnd | Rx | Tx 
--|--|--
1 | 7 | 9

## USB pinout
Gnd | D+ (USB_DP) | D- (USB_DN) | +5V (usb_vbus+ext_per) 
-- | -- | -- | -- 
1 | 2 | 3 | 4+5

## Installing drivers
The drivers from the manufacturer's disc work fine. Download here: [VS7SA7_Handset_Manager_USB.zip](https://fw.fasoley.net/?file=panasonic/VS7SA7_Handset_Manager_USB.zip)
Tested on Windows XP and Windows 8.1 x86.

# Entering PTEST mode
PTEST (production test) is the phone’s test mode, preferred for working with the phone in an unsupported state.
Press and hold `*` and `#`, then (while holding them) power on the phone with the red button.

![image](https://github.com/user-attachments/assets/b32179f7-6506-4a3c-9c57-53b8aafaf066)

# Service software
Infineon’s own PhoneTool is applicable. Versions 50 and 60 complement each other: 60 works for the Audio tab and RAM read/write, 50 handles everything else.

## Download
- [PhoneTool x50](https://fw.fasoley.net/?file=panasonic/phonetool/PhoneTool%2050_setup.exe) + [patched dwdio.dll](https://fw.fasoley.net/?file=panasonic/phonetool/dwdio.dll)
- [PhoneTool x60]

## Installation
- x50: Install, replace `dwdio.dll` with a patched version in the installation folder, then use.
- x60: Extract, import registry entries from `x60factory-registri.zip\m\m\x60.reg`, then use.

## Usage
After launching, specify the required COM port in `Settings`.
Connect using the Update info button. If it doesn’t work immediately, try pressing `V24 AT# on/off` a few times.

# Dumping Flash Memory Contents
Possible on both Linux and Windows with any cable (USB or UART).
First, put the phone into PTEST mode.

## Arch Linux
```bash
yay -S pnpm
git clone https://github.com/siemens-mobile-hacks/node-sie-serial
cd node-sie-serial/
pnpm i
npx tsx examples/dwd-apoxi-memory-dump.js \
  --addr 0xA0000000 \     # Memory address where flash begins
  --size 0x4000000 \      # Reading length: 64 MB
  --out ./sa7-vq24.bin \  # Output filename
  --port /dev/ttyACM0     # Port path
```

## Windows
1. https://scoop.sh/
2. https://git-scm.com/downloads/win
3. `scoop bucket add main`
4. `scoop install main/nodejs`
5. `corepack enable`
6. `git clone https://github.com/siemens-mobile-hacks/node-sie-serial`
7. `cd node-sie-serial`
8. `pnpm i`
9. `npx tsx examples/dwd-apoxi-memory-dump.js --addr 0xA0000000 --size 0x4000000 --out .\sa7-vq24.bin --port COM7`

# Bootloader unlocking
Also possible on Linux and Windows with any cable (USB or UART).
Must be done from PTEST mode.
Required to enable flash memory writing via V_Klay or x65flasher

## Linux
1. `cd node-sie-serial`
2. `npx tsx examples/dwd-apoxi-unlock-boot.ts --port /dev/ttyACM0`

## Windows
1. `cd node-sie-serial`
2. `npx tsx examples\dwd-apoxi-unlock-boot.ts --port COM7`

# Writing flash memory
Only possible via UART.
Briefly: 
- Install [V_Klay](https://fw.fasoley.net/?file=panasonic/v_klay_setup.zip).
- Place [pmb8875_test_point.vkd](https://fw.fasoley.net/?file=panasonic/pmb8875_test_point.vkd) in `Program Files\Vi-Soft\V_Klay\loaders\`.
- Select this loader, connect to the phone at 115200 baud for writing or 921600 baud for reading.

With [x65flasher](https://fw.fasoley.net/?file=panasonic/x65Flasher-2103.rar)  it’s simpler: select the "Phone with entered SKEY" loader and work at the same speeds.

# Flashing a newer FW version
Only possible via UART.
First, back up your EEPROM it contains RF and battery calibrations. Use PhoneTool x50 with the appropriate EEPROM config file (for VS7/SA7/MX7, it’s [leopard_eep150.cfg](https://fw.fasoley.net/?file=panasonic/eeprom/leopard_eep150.cfg)) in PTEST mode. 
After saving the EEPROM backup, download the desired firmware dump and flash it using x65flasher or V_Klay.
Reconnect to PhoneTool x50 and import the previously saved EEPROM dump in PTEST mode.
