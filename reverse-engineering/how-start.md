# How reverse engineering Siemens in the 2k24?
Prerequisites:
1. Installed the latest version of **Ghidra SRE**.
2. Fullflash for the Siemens SGOLD/NewSGOLD phone.
3. RAM memory dump (8 or 16 Mb from 0xA8000000).

### Open fullflash in the Ghidra
1. Run the disassembler and click `File` -> `Import File`
2. Select your fullflash.bin
3. Select the appropriate disassembler settings:
    - Format: `Raw Binary`
    - Language: `ARM v5t 32 little`
    - Options -> Block Name: `FULLFLASH`
    - Options -> Base Address: `A0000000`
  
    ![Open options](img/open-options.png)
    
    ![Open options](img/open-options2.png)
4. Then click on `fullflash.bin` in the project files.
5. Reject analyzing (press "No").

   ![No analyze](img/no-analyze.png)

### Define IO memory region
1. Click `Window` -> `Memory Map`
2. Add new memory region with given settings:
   - Block Name: `IO`
   - Start Addr: `0xF0000000`
   - Length: `0x0F000000`
   - Attributes: `Read + Write + Volatile`
   - Uninitialized

    ![Open options](img/io-memory-region.png)

### Import some memory from phone
TODO

### Import swilib C types
1. Download appropriate `swilib-types-PLATFORM.h` from the [Swilib data types for dissasembler](https://siemens-mobile-hacks.github.io/web-dev-tools/re#swilib-types).
2. Click: `File` -> `Parse C Source...`
3. Click `Clear profile` (eraser icon).
4. Add your `swilib-types-PLATFORM.h` to the "Source files to parse".
5. Select "Program architecture" to `ARM v5t 32 little`.
6. Press `Parse to Program` -> `Continue` -> `Don't use Open Archives` -> `OK`

### Import swilib symbols
1. Download appropriate `symbols-PHONE.txt` from the [Firmware symbols for dissasembler](https://siemens-mobile-hacks.github.io/web-dev-tools/re#swilib-symbols).
2. Click `Window` -> `Script Manager` -> `ImportSymbolsWithDataType.java` -> `Run Script`
3. Select your `symbols-PHONE.txt`.

### Import CPU IO registers
1. Download appropriate `cpu-PHONE.txt` or `cpu-pmb887x.txt` from the [CPU IO registers](https://siemens-mobile-hacks.github.io/web-dev-tools/re#cpu-registers).
2. Click `Window` -> `Script Manager` -> `ImportSymbolsWithDataType.java` -> `Run Script`
3. Select your `cpu-PHONE.txt` or `cpu-pmb887x.txt`.

### Analyze firmware
TODO
