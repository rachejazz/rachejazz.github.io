---
title: Troubleshooting USB Flash Drive Detection in the Linux Kernel
layout: posts
author: Divya
---

## Why you should boot a self compiled kernel atleast once in your life.


## Problem Statement:
Mounting usb drive on an ubuntu machine.
Easy? Well I thought so until 3yrs back:
```
divya@rachejazzblog:~$ sudo mount /dev/sdb /mnt/usb/
[sudo] password for divya:
mount: /mnt/usb: wrong fs type, bad option, bad superblock on /dev/sdb, missing codepage or helper program, or other error.
```
UGH!!!! WHY???
Solution?
1. Format disk- WHAT? NO! I have sensitive content.
2. Change OS - eh?
3. Troubleshoot yourself - Uhh...I am not too comfy with drivers and kernels and all that yk.

Me:
Let's begin with 3.

# First up. What caused that error.
Inject usb, let's get started.
Now, the kernel gods check the heart beat of the kernel through `dmesg`
```
DMESG(1)                        User Commands                       DMESG(1)

NAME
       dmesg - print or control the kernel ring buffer
```

Starting from that:
Latest entries show:
```
[   42.547467] usb 1-1: new high-speed USB device number 2 using ehci-pci
[   44.351449] usb 1-1: New USB device found, idVendor=0930, idProduct=6544, bcdDevice= 1.00
[   44.351455] usb 1-1: New USB device strings: Mfr=1, Product=2, SerialNumber=3
[   44.351459] usb 1-1: Product: DataTraveler 120
[   44.351463] usb 1-1: Manufacturer: Kingston
[   44.351466] usb 1-1: SerialNumber: 001E4F923A63C910A5430647
[   44.860402] usb-storage 1-1:1.0: USB Mass Storage device detected
[   44.861761] scsi host33: usb-storage 1-1:1.0
[   44.862160] usbcore: registered new interface driver usb-storage
[   44.918173] usbcore: registered new interface driver uas
[   45.879654] scsi 33:0:0:0: Direct-Access     Kingston DataTraveler 120 1.00 PQ: 0 ANSI: 2
[   45.881809] sd 33:0:0:0: Attached scsi generic sg3 type 0
[   45.884672] sd 33:0:0:0: [sdb] 7823296 512-byte logical blocks: (4.01 GB/3.73 GiB)
[   45.887095] sd 33:0:0:0: [sdb] Write Protect is off
[   45.887104] sd 33:0:0:0: [sdb] Mode Sense: 65 44 09 30
[   45.889032] sd 33:0:0:0: [sdb] No Caching mode page found
[   45.889103] sd 33:0:0:0: [sdb] Assuming drive cache: write through
[   45.937467] sd 33:0:0:0: [sdb] Attached SCSI removable disk
[  598.527900] e1000: ens33 NIC Link is Down
[  602.552714] e1000: ens33 NIC Link is Up 1000 Mbps Full Duplex, Flow Control: None
```

So my kernel *does* reconginze the thumb drive. Let's filter out the "error" part
```
divya@rachejazzblog:~$ dmesg --level=err
[    2.208683] piix4_smbus 0000:00:07.3: SMBus Host Controller not enabled!
[    2.798407] sd 32:0:0:0: [sda] Assuming drive cache: write through
[   45.889032] sd 33:0:0:0: [sdb] No Caching mode page found
[   45.889103] sd 33:0:0:0: [sdb] Assuming drive cache: write through
```
We are concerned with the sdb part(that's how your kernel allocates "nicknames" to call your devices)
"No Caching mode page found"

So we know it _is_ an error in the kernel ring.
*sigh*. Forget it. Let's change OS.

I was kidding. I changed the kernel instead.

# Compiling and building kernel on your own
Now I will be using linux-next tree but you can try the stabler main tree as well.
1. Git clone
2. copy config file
3. make 
4. install
5. reboot
check uname -r
Ah! now we can start messing up. Afterall the kernel is ours :D

## Test the problem. Hopefully it still exists.
Same config file. Let's start digging

# Is the usb listed under `lsusb`?
```
modprobe: FATAL: Module usb_storage not found in directory /lib/modules/5.13.0-rc4-next-20210603
[divya@rachejazzblog ~]$lsusb
Bus 001 Device 002: ID 058f:6387 Alcor Micro Corp. Flash Drive
Bus 001 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub
Bus 002 Device 003: ID 0e0f:0002 VMware, Inc. Virtual USB Hub
Bus 002 Device 002: ID 0e0f:0003 VMware, Inc. Virtual Mouse
Bus 002 Device 001: ID 1d6b:0001 Linux Foundation 1.1 root hub
```
Yes, it does.
# Where else can you see the usb plugged in?
```
[divya@rachejazzblog ~]$lsblk -f
NAME   FSTYPE  LABEL                           UUID                                 FSAVAIL FSUSE% MOUNTPOINT
fd0
sda
├─sda1
└─sda2 ext4                                    e633212a-0588-492b-a5ce-7803b4d8348a   47.3G    25% /
sr0    iso9660 CDROM                           2021-05-24-00-20-50-00
sr1    iso9660 Ubuntu-Server 20.04.2 LTS amd64 2021-02-01-17-57-41-00
```
It does not list under SCSI block devices
Recheck:
```
[divya@rachejazzblog ~]$sudo fdisk -l
[divya@rachejazzblog ~]$sudo fdisk -l
[sudo] password for divya: 
Disk /dev/fd0: 1.42 MiB, 1474560 bytes, 2880 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0x90909090

Device     Boot      Start        End    Sectors  Size Id Type
/dev/fd0p1      2425393296 4850786591 2425393296  1.1T 90 unknown
/dev/fd0p2      2425393296 4850786591 2425393296  1.1T 90 unknown
/dev/fd0p3      2425393296 4850786591 2425393296  1.1T 90 unknown
/dev/fd0p4      2425393296 4850786591 2425393296  1.1T 90 unknown


Disk /dev/sda: 70 GiB, 75161927680 bytes, 146800640 sectors
Disk model: VMware Virtual S
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: gpt
Disk identifier: D7F8DF7E-9C6C-4314-BFCA-5B463C68318E

Device     Start       End   Sectors Size Type
/dev/sda1   2048      4095      2048   1M BIOS boot
/dev/sda2   4096 144707583 144703488  69G Linux filesystem
```

Subproblem no. 1 - device does not show up as block device.
It can be possible that in your newly installed kernel, there can be some modules which are not loaded.
In this case, we need to load module `usb_storage` manually which is responsible for USB Mass Storage on Linux.

1. Go to the newly cloned linux tree directory. 
2. Open the config file in a text editor
3. Search for "STORAGE" 8-)

So now we know why usb did not show up as a storage block device. Because it was not told to the kernel to setup!
Change it to:
```
CONFIG_USB_STORAGE=y
```
Now, we build the kernel again against the new config
Do a `make -j3` and relax for awhile
*NOTE* You will be asked a couple of questions about each usb brand config. Hitting enter for the time being won't be harmful.
Something like this:
(show kernel compile image)
Install the new kernel `sudo make modules_install install`
reboot into new kernel
verify using `uname -r`(will be the same with a -dirty tag)

```
[divya@rachejazzblog ~]$modprobe usb_storage
[divya@rachejazzblog:~]$ lsmod | grep usb
usb_storage            77824  1 uas
usbhid                 57344  0
hid                   131072  2 usbhid,hid_generic
```
Check whether usb is visible on lsblk and fdisk now or not:
```
[divya@rachejazzblog ~]$sudo fdisk -l
[sudo] password for divya:
Disk /dev/fd0: 1.42 MiB, 1474560 bytes, 2880 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0x90909090

Device     Boot      Start        End    Sectors  Size Id Type
/dev/fd0p1      2425393296 4850786591 2425393296  1.1T 90 unknown
/dev/fd0p2      2425393296 4850786591 2425393296  1.1T 90 unknown
/dev/fd0p3      2425393296 4850786591 2425393296  1.1T 90 unknown
/dev/fd0p4      2425393296 4850786591 2425393296  1.1T 90 unknown


Disk /dev/sda: 70 GiB, 75161927680 bytes, 146800640 sectors
Disk model: VMware Virtual S
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: gpt
Disk identifier: D7F8DF7E-9C6C-4314-BFCA-5B463C68318E

Device     Start       End   Sectors Size Type
/dev/sda1   2048      4095      2048   1M BIOS boot
/dev/sda2   4096 144707583 144703488  69G Linux filesystem


Disk /dev/sdb: 15 GiB, 16106127360 bytes, 31457280 sectors
Disk model: Flash Disk
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
```
And
```
[divya@rachejazzblog ~]$lsblk
NAME   MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
fd0      2:0    1  1.4M  0 disk 
sda      8:0    0   70G  0 disk 
├─sda1   8:1    0    1M  0 part 
└─sda2   8:2    0   69G  0 part /
sdb      8:16   1   15G  0 disk 
sr0     11:0    1 93.2M  0 rom  
sr1     11:1    1  1.1G  0 rom 
```
Phew! Flash drive is atleast visible now!

So, this is a small instance where a problem can be solved looking at the config of your current kernel.
Interested in what else can there be?
Hop in! 
> See what more can be explored: [The Linux Foundation](https://lfx.linuxfoundation.org/)
