---
title: I got my hands on a Raspberry Pi Pico firmware.
layout: posts
author: Divya
---
## So I reversed it on Ghidra and emulated it on Unicorn.

### How I came up with the idea
This was part of my university challenge. I feared hardware for a long time. This time however, I was guided to use [Unicorn](https://www.unicorn-engine.org/),
a CPU emulator to do this challenge. I went through the documentation but couldn't find much on to go on for emulating pico architecture (ARM arch).

> Well problem statement was, I given a firmware dump from a pico and a debug flags compiled ELF binary of the same firmware.
> The pico accepts a random pin, and if correctly guessed, it will print the flag.

### Bruteforce by loading it on my pico?
Nah, pin was somewhere in [0,9999] and firmware starts messing up with the terminal if given the wrong pin.
We will bruteforce it, however not in the pico way, but in the Unicorn way!

### Identify pico architecture, load the firmware dump. CAUTION: Careful with Memory!!
I discovered that pico uses ARM architecture. Now ARM processors use 2 modes. Thum mode and ARM mode. In the challenge it
was hinted if we had issues emulating, we need to make sure to include the Thumb Bit. The thumb mode makes execution faster,
decreasing code density. So now what remains is loading the firmware dump and see if it works in this Thumb Mode.

### But wait, how much memory does it need? Which address should it start emulating from? Ghidra time
Remember the debug flags compiled elf version of the firmware? Yeah we need it now. Loading it on ghidra
I saw the starting address of main.
```
                     **************************************************************
                     *                          FUNCTION                          *
                     **************************************************************
                     undefined main()
                       assume LRset = 0x0
                       assume TMode = 0x1
     undefined         r0:1           <RETURN>
     undefined4        Stack[-0x21c   local_21c                               XREF[5]:     10000a92(R),
                                                                                           10000aac(R),
                                                                                           10000ab2(R),
                                                                                           10000abc(R),
                                                                                           10000ac6(R)
                     main+1                                          XREF[2,1]:   Entry Point(*),
                     main                                                         _reset_handler:10000220(c),
                                                                                  _reset_handler:1000021e(*)
...Snipped...
                     LAB_10000a8a                                    XREF[2]:     10000ac0(j), 10000ac8(j)
10000a8a 03 2b           cmp        r3,#0x3
10000a8c 02 d1           bne        LAB_10000a94
10000a8e ff f7 e7 fc     bl         assignment_2B_rehost                             undefined assignment_2B_rehost()
10000a92 01 9b           ldr        r3,[sp,#local_21c]
                     LAB_10000a94                                    XREF[1]:     10000a8c(j)
10000a94 e2 5c           ldrb       r2,[r4,r3]
10000a96 01 32           adds       r2,#0x1
10000a98 d2 b2           uxtb       r2,r2
10000a9a e2 54           strb       r2,[r4,r3]
```
The function or the choice we are interested in, is the rehosting function at 0x10000a8e
Now once we reach it's definition, we see the starting address of rehosting is 0x10000460.
Now once we have the starting address, we need the ending address of this function. Scroll down where it ends:
```
                     **************************************************************
                     *                          FUNCTION                          *
                     **************************************************************
                     undefined assignment_2B_rehost()
                       assume LRset = 0x0
                       assume TMode = 0x1
     undefined         r0:1           <RETURN>
     undefined2        Stack[-0x126   local_126                               XREF[1]:     1000048c(W)  
     undefined2        Stack[-0x128   local_128                               XREF[1]:     10000488(*)  
                     assignment_2B_rehost                            XREF[2]:     Entry Point(*), main:10000a8e(c)  
10000460 70 b5           push       {r4,r5,r6,lr}
10000462 18 48           ldr        r0=>s_Enter_the_pin:_1000d080,[DAT_100004c4]     = "Enter the pin: "
                                                                                     = 1000D080h
10000464 c6 b0           sub        sp,#0x118
10000466 04 f0 6d ff     bl         __wrap_printf                                    undefined __wrap_printf()
1000046a 69 46           mov        r1,sp
1000046c 16 48           ldr        r0=>s_%hd_1000d090,[DAT_100004c8]                = "%hd"
                                                                                     = 1000D090h
1000046e 07 f0 1f fe     bl         scanf                                            int scanf(char * __format, ...)
10000472 05 ad           add        r5,sp,#0x14
10000474 64 20           movs       r0,#0x64
10000476 01 f0 c7 f9     bl         sleep_ms                                         undefined sleep_ms()
1000047a 41 22           movs       r2,#0x41
1000047c 28 00           movs       r0,r5
1000047e 13 49           ldr        r1=>DAT_1000d094,[DAT_100004cc]                  = 42h
                                                                                     = 1000D094h
10000480 04 f0 a8 fc     bl         __wrap_memcpy                                    undefined __wrap_memcpy()
10000484 6b 46           mov        r3,sp
10000486 9e 1c           adds       r6,r3,#0x2
10000488 1b 88           ldrh       r3=>local_128,[r3,#0x0]
1000048a 01 ac           add        r4,sp,#0x4
1000048c 33 80           strh       r3,[r6,#0x0]=>local_126
                     LAB_1000048e                                    XREF[1]:     1000049c(j)  
1000048e 20 00           movs       r0,r4
10000490 02 22           movs       r2,#0x2
10000492 31 00           movs       r1,r6
10000494 02 34           adds       r4,#0x2
10000496 04 f0 9d fc     bl         __wrap_memcpy                                    undefined __wrap_memcpy()
1000049a a5 42           cmp        r5,r4
1000049c f7 d1           bne        LAB_1000048e
1000049e 01 a9           add        r1,sp,#0x4
100004a0 16 a8           add        r0,sp,#0x58
100004a2 00 f0 6d fa     bl         AES_init_ctx                                     undefined AES_init_ctx()
100004a6 2c 00           movs       r4,r5
100004a8 15 ae           add        r6,sp,#0x54
                     LAB_100004aa                                    XREF[1]:     100004b6(j)  
100004aa 21 00           movs       r1,r4
100004ac 16 a8           add        r0,sp,#0x58
100004ae 10 34           adds       r4,#0x10
100004b0 00 f0 6a fa     bl         AES_ECB_decrypt                                  undefined AES_ECB_decrypt()
100004b4 b4 42           cmp        r4,r6
100004b6 f8 d1           bne        LAB_100004aa
100004b8 28 00           movs       r0,r5
100004ba 04 f0 ef fd     bl         __wrap_puts                                      undefined __wrap_puts()
100004be 46 b0           add        sp,#0x118
100004c0 70 bd           pop        {r4,r5,r6,pc}
100004c2 c0              ??         C0h
100004c3 46              ??         46h    F
```
So it is the region where the pop operation takes place at 0x100004c0. This means it's now clearing its stack and ready to return to main.
We can quickly spin up our emulation code based on the above information.
```
from unicorn import *
from unicorn.arm_const import *
PICO_FLASH_START = 0x10000000
PICO_FLASH_SIZE = 2 * 1024 * 1024  # 2MB

# Function addresses
FUNC_START_ADDR = 0x10000460
FUNC_END_ADDR = 0x100004c0

with open("fw.bin", "rb") as f:
	firmware_data = f.read()

# Initialize emulator
mu = Uc(UC_ARCH_ARM, UC_MODE_THUMB)
# Map address to load firmware dump
mu.mem_map(PICO_FLASH_START, PICO_FLASH_SIZE)

# Write memory data
mu.mem_write(PICO_FLASH_START, firmware_data)
mu.emu_start(FUNC_START_ADDR | 1, FUNC_END_ADDR) # The "| 1" denotes switching on the thumb bit.
```
Now, how do we know this is working? Unicorn offers hook functionality that gets called when we start emulating.
In this hook function, we can modify, print or program stuff that needs to be done when control reaches a particular address.
For now, we will add ways to check if pc (program counter) is traversing the addresses correctly and whether we can read
assembly operation happening at each. For this we will use [capstone](https://www.capstone-engine.org/lang_python.html) to read opcodes and print to us.
```
from capstone import *
def hook_output(mu, address, size, user_data):
md = Cs(CS_ARCH_ARM, CS_MODE_THUMB)
md.detail = True

data = bytes(mu.mem_read(address, size))
for each in md.disasm(data, address):
	inst = ("\t%s\t%s" %(each.mnemonic, each.op_str))
	print(f"Tracing>>>0x{address:X}: {inst}")
```
Now we add this hook just before emulation with the start and end address of rehosting function.
```
mu.hook_add(UC_HOOK_CODE, hook_output, begin=FUNC_START_ADDR, end=FUNC_END_ADDR)
mu.emu_start(FUNC_START_ADDR | 1, FUNC_END_ADDR)
```
### Finally let's run it!
```
Tracing>>>0x10000460: 	push	{r4, r5, r6, lr}
Tracing>>>0x10000462: 	ldr	r0, [pc, #0x60]
Tracing>>>0x10000464: 	sub	sp, #0x118
Tracing>>>0x10000466: 	bl	#0x10005344
Skipping function at address: 0x10000466
Tracing>>>0x1000046A: 	mov	r1, sp
Tracing>>>0x1000046C: 	ldr	r0, [pc, #0x58]
Tracing>>>0x1000046E: 	bl	#0x100080b0
Traceback (most recent call last):
  File "path/to/emulate.py", line 140, in <module>
    main()
  File "path/to/emulate.py", line 137, in main
    mu.emu_start(FUNC_START_ADDR | 1, FUNC_END_ADDR)
  File "venvpath/toenv/lib/python3.11/site-packages/unicorn/unicorn.py", line 547, in emu_start
    raise UcError(status)
unicorn.unicorn.UcError: Invalid memory read (UC_ERR_READ_UNMAPPED)
```
Okay....so there is some operation that makes the emulation crash, let's see what's in the next address that causing this.
Scroll up to see what is the operation we see that's at that address on ghidra. Its a `__wrap_printf` function.
Since the program is run on a emulator and we haven't defined what it should do at `printf`, it crashes at that address saying
`UC_ERR_READ_UNMAPPED`. At this point, we have 2 ways to proceed:
*	Create a printf implementation and move forward
*	Use another hook to skip it and move forward

Since it's a harmless printf statement which just prints "Enter your pin", we can move forward with the second option
```
def hook_skip(mu, address, size, user_data):
	instructions_skip_list = [0x10000466]
	if address in instructions_skip_list:
		print("Skipping function at address:", hex(address))
		mu.reg_write(PC, address+size | 1)
	return True
```
And again, we add it just above emulation starts
```
mu.hook_add(UC_HOOK_CODE, hook_skip, begin=FUNC_START_ADDR, end=FUNC_END_ADDR)
mu.hook_add(UC_HOOK_CODE, hook_output, begin=FUNC_START_ADDR, end=FUNC_END_ADDR)
mu.emu_start(FUNC_START_ADDR | 1, FUNC_END_ADDR)
```
We run it again!
```
Tracing>>>0x10000460: 	push	{r4, r5, r6, lr}
Tracing>>>0x10000462: 	ldr	r0, [pc, #0x60]
Tracing>>>0x10000464: 	sub	sp, #0x118
Tracing>>>0x10000466: 	bl	#0x10005344
Skipping function at address: 0x10000466
Tracing>>>0x1000046A: 	mov	r1, sp
Tracing>>>0x1000046C: 	ldr	r0, [pc, #0x58]
Tracing>>>0x1000046E: 	bl	#0x100080b0
Traceback (most recent call last):
  File "path/to/emulate.py", line 140, in <module>
    main()
  File "path/to/emulate.py", line 137, in main
    mu.emu_start(FUNC_START_ADDR | 1, FUNC_END_ADDR)
  File "venvpath/toenv/lib/python3.11/site-packages/unicorn/unicorn.py", line 547, in emu_start
    raise UcError(status)
unicorn.unicorn.UcError: Invalid memory read (UC_ERR_READ_UNMAPPED)
```
Okayy, so we know that it's working. We gotta skip few more functions the same way until we reach the place
where we need to bruteforce pins. Looking back at ghidra address, we have `scanf` at 0x1000046E, `sleep_ms` at 0x10000476
and `__wrap_puts` at 0x100004BA <br>
We put all these addresses into skip_instructions array.
```
instructions_skip_list = [0x10000466, 0x10000476, 0x100004BA]
```
But hold on, if we skip scanf, how are we going to take pin as input? Now we shall create another hook which will handle
data sent to scanf. Let's re read the assembly just above scanf.
```
1000046a 69 46           mov        r1,sp
1000046c 16 48           ldr        r0=>s_%hd_1000d090,[DAT_100004c8]                = "%hd"
                                                                                     = 1000D090h
1000046e 07 f0 1f fe     bl         scanf                                            int scanf(char * __format, ...)
```
Since scanf takes 2 parameters, we see that r0 stores the modifier "%hd" and r1 stores whatever value is passed from stdin.
So all we need to do is, when control reaches scanf, we store the value of pin to r1 and move ahead!
Oh and, since we're dealing in assembly, we ALWAYS send data in appropriate bytes.
```
PIN = 0
def hook_input(mu, address, size, user_data):
	if address == 0x1000046e:
		print("Input function called at address:", hex(address))
		r1=mu.reg_read(R1)
		mu.mem_write(r1, PIN.to_bytes(2, 'little'))
		mu.reg_write(PC, address+size | 1)
```
As always, we add this new hook just above emulate start and run it again.
```
┬─[divya@racharch:~/a/U/D/a/rehosting]─[08:33:37 PM]─[V:env]─[B:55%, 01:29:55 remaining]
╰─>λ python emulate.py
Tracing>>>0x10000460: 	push	{r4, r5, r6, lr}
Tracing>>>0x10000462: 	ldr	r0, [pc, #0x60]
Tracing>>>0x10000464: 	sub	sp, #0x118
Tracing>>>0x10000466: 	bl	#0x10005344
Skipping function at address: 0x10000466
Tracing>>>0x1000046A: 	mov	r1, sp
Tracing>>>0x1000046C: 	ldr	r0, [pc, #0x58]
Tracing>>>0x1000046E: 	bl	#0x100080b0
Input function called at address: 0x1000046e
Tracing>>>0x10000472: 	add	r5, sp, #0x14
Tracing>>>0x10000474: 	movs	r0, #0x64
Tracing>>>0x10000476: 	bl	#0x10001808
Skipping function at address: 0x10000476
Tracing>>>0x1000047A: 	movs	r2, #0x41
...Snipping...
Tracing>>>0x100004B4: 	cmp	r4, r6
Tracing>>>0x100004B6: 	bne	#0x100004aa
Tracing>>>0x100004B8: 	movs	r0, r5
Tracing>>>0x100004BA: 	bl	#0x1000509c
Skipping function at address: 0x100004ba
Tracing>>>0x100004BE: 	add	sp, #0x118
```

### Time to start bruteforce and print the flag!
Ok now we can see the emulation works. All now we need to do is loop emulation with every possible pin value
and then read the value that will be passed to `__wrap_puts`
So the solution now is:
*	Create loop starting from 0 to 9999
*	make PIN global so that hook functions can read the value
*	Add hook to write pin to register r1
*	Add hook to skip addresses where it might crash
*	At `puts` address, print the value of r0
We remove all the debug statements including capstone lines. Program for all the above:

```
from unicorn import *
from unicorn.arm_const import *
from capstone import *
import struct

# Memory addresses
PICO_FLASH_START = 0x10000000
PICO_FLASH_SIZE = 2 * 1024 * 1024  # 2MB
R0 = UC_ARM_REG_R0
R1 = UC_ARM_REG_R1
PC = UC_ARM_REG_PC
SP = UC_ARM_REG_SP
PIN = 0

# Function addresses
FUNC_START_ADDR = 0x10000460
FUNC_END_ADDR = 0x100004c0

# Hook for functions to skip
def hook_skip(mu, address, size, user_data):
	instructions_skip_list = [0x10000466, 0x10000476, 0x100004BA]
	if address in instructions_skip_list:
		mu.reg_write(PC, address+size | 1)
	return True

# Hook for output functions
def hook_output(mu, address, size, user_data):
	if address == 0x100004BA:
		flag = mu.reg_read(R0)
		print(f"flag for pin {PIN}: {flag}")

# Hook for input function
def hook_input(mu, address, size, user_data):
	if address == 0x1000046e:
		print("Input function called at address:", hex(address))
		r1=mu.reg_read(R1)
		mu.mem_write(r1, PIN.to_bytes(2, 'little'))
		mu.reg_write(PC, address+size | 1)

# Main function
def main():
	global PIN
	with open("fw.bin", "rb") as f:
		firmware_data = f.read()

	# Initialize emulator
	mu = Uc(UC_ARCH_ARM, UC_MODE_THUMB)
	mu.mem_map(PICO_FLASH_START, PICO_FLASH_SIZE)
	mu.reg_write(SP, PICO_RAM_START + PICO_RAM_SIZE - 0x1000)

	# Write memory data
	mu.mem_write(PICO_FLASH_START, firmware_data)

	# Add hooks
	mu.hook_add(UC_HOOK_CODE, hook_output, begin=FUNC_START_ADDR, end=FUNC_END_ADDR)
	mu.hook_add(UC_HOOK_CODE, hook_skip, begin=FUNC_START_ADDR, end=FUNC_END_ADDR)
	mu.hook_add(UC_HOOK_CODE, hook_input, begin=FUNC_START_ADDR, end=FUNC_END_ADDR)

	# Emulate rehosted function
	for pin in range(10000):
		PIN = pin
		mu.emu_start(FUNC_START_ADDR | 1, FUNC_END_ADDR)

if __name__ == "__main__":
	main()
```
For working purposes, lets try first with only 1 pin value.
```
┬─[divya@racharch:~/a/U/D/a/rehosting]─[08:33:37 PM]─[V:env]─[B:55%, 01:29:55 remaining]
╰─>λ python emulate.py
Skipping function at address: 0x10000466
Input function called at address: 0x1000046e
Skipping function at address: 0x10000476
flag for pin 0: 538963692
Skipping function at address: 0x100004ba
```
Huh, well how could I really think a long string such as the flag will be directly stored at a register?
That would mean R0 stores the address where the value of the flag is stored. Now we quickly edit the output function.
```
# Hook for output functions
def hook_output(mu, address, size, user_data):
	if address == 0x100004BA:
		flag_addr = mu.reg_read(R0)
		flag = mu.mem_read(flag_addr, 20) #lets say we want to read 20 next addresses
		print(f"flag: {flag}")
```
Now when we run it with pin 0:
```
╰─>λ python emulate.py
Skipping function at address: 0x10000466
Input function called at address: 0x1000046e
Skipping function at address: 0x10000476
flag for pin 0: bytearray(b'uL\xa8\xa1\x0b\x1a\xc6\xa21G\x0f\xaa\x0e\xeb\xe4\xb8\xba\x18\xd9K')
Skipping function at address: 0x100004ba
```
OK! so we are infact able to see a string with the corresponding pin. Now we loop it around 0 to 9999
and redirect the output to a file. Our flag should be starting with `sshs`, so we can grep that out later!
<script src="https://asciinema.org/a/648892.js" id="asciicast-648892" async="true"></script>

### Found the pin! print the entire flag!
Now since we know which pin is the correct pin for printing the flag, 
All we need to do is keep on printing the flag until we receive a closing braces.
And voila:
```
╰─>λ python emulate.py
flag for 4919: bytearray(b'sshs{8ea8549aff0b37a8d1f537c65aebfe55}')
```

This was a fun challenge which helped to understand code emulation and assembly!
