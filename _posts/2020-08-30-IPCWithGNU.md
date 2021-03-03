---
title: GNU toolchain on InterProcess Communication(IPC)
layout: posts
author: Divya
---
### Run, break, study, re-run, dump. The 3G from GNU tool chain is here to make your life easier.

While gorging down your favorite snack, what tells your hands to stop before you
die from overeating? Well thanks to our operating systems, we never need to
check over our process queue to ensure everything is working smooth.

![](https://cdn-images-1.medium.com/max/800/1*0x2oyDOACE8mgObB7tbibA.jpeg)

So does this box thingy in our hands also needs a check over it’s workflow?

![](https://cdn-images-1.medium.com/max/800/1*CIjdZa3Zvh7WZd79aZduVA.jpeg)
<br><span class="figcaption_hack">Just a screenshot of my dramatic phone’s log file.</span>

What stops them from ***dying*** from overeating? While diagnosing disorders in
us doesn’t require anatomizing ourselves, in the IT world there are tools that
can be used to troubleshoot or “Look What’s Inside?” any operating system and
how process communication work.

> *enter stage **The 3G**. Here’s a short bio for each:

`gcc` : the GNU project C and C++ compiler. Involves preprocessing, compilation,
assembly and linking.<br> `gdb` : the GNU Debugger. Allows you to see what
happens “inside” a program when it executes.<br> `gcov` : the GNU coverage
testing tool. Helps you to discover untested parts of your code, helps you to
analyze the number of times every line of your code is executed.

To know more about each of them, open your terminal, type `man` followed by any
of them.

*****

To investigate their business and their roles in systems development, we will
now create a tiny subsystem of 2 processes communicating with each other.

> I will summon the powers of IPC and SIGNALs to help me make them talk.

A brief little map of how I established communication:

* Neighbour1 creates a shared memory segment and **invites** anyone willing to
share the place with him(I have used ftok() to create the key, shmget() to get
the memory, shmat() to attach a pointer which will point to the process id).
* Neighbour2, knowing the address of neighbour1’s house, decides to live with
him(I have used shmget() to get the memory of the previous process, shmat() to
attach pointer to the previous process id, shmdt() to detach the pointer).

Read more about [process
communication](https://www.ibm.com/support/knowledgecenter/en/SSLTBW_2.3.0/com.ibm.zos.v2r3.bpxbd00/rftok.htm)
and [signal
handling](http://www.csl.mtu.edu/cs4411.ck/www/NOTES/signal/kill.html).

These are the neighbours we’ll be studying today. One annoys, while the other
tries to *calm* things down and provides the user with 3 options:

> The nextdoor neighbour annoys me. What should I do to him? Kidnap, kill or let
> him go?

**Neighbour 1(annoying infinite looped process disturbing neighbour 2):**

<span class="figcaption_hack">neighbour1.c</span>
[View neighbour1.c on gist.github.com](https://gist.github.com/rachejazz/88576904694064f51f58e9602b8c460b)

**Neighbour 2(resolves by sending signals to neighbour 1):**

<span class="figcaption_hack">neighbour2.c</span>
[View neighbour2.c on gist.github.com](https://gist.github.com/rachejazz/3228be9f0a74cbf1ab1c5674e110db6b)

Compile both the processes using gcc. Although, we will use different flags for
each. <br> For process 1, we will analyze code coverage using gcov. Compile
using:

    $gcc -Wall -fprofile-arcs -ftest-coverage neighboour1.c -o neighbour1

For process 2, we will experiment and try changing the user input data in the
course of execution process using gdb.(Wait. Is that possible?) Compile using:

    $gcc -g neighbour2.c -o neighbour2

*****

Alright! Now that our mini ecosystem is created, we employ the 3G to analyse
what’s going on. Execute them to make them talk. You can either execute them in
2 different windows, or use the following to send neighbour1 to background and
execute them simultaneously:

    $./neighbour1 & ./neighbour2

Both of them should work. Now, what will a normal user do to a process annoying
him? Kill? Kidnap? Let’s see:

<span class="figcaption_hack">user sending kidnap or kill instruction.</span>
[Demo on youtube.com](https://youtu.be/yd2oAlZPoSk)

So we see process 2 ended up killing process 1. Although just before getting
killed neighbour 1 dumped his execution logs. Let’s analyze that. Remember gcov?
Next step:

    $gcov neighbour1

    File 'neighbour1.c'
    Lines executed:55.10% of 49
    Creating 'neighbour1.c.gcov'

    $cat neighbour1.c.gcov

What you now see is the number of times each line of code is executed/checked.
Here’s a snippet for you to relate:

[](https://cdn-images-1.medium.com/max/800/1*J7iNcgoUYDZvbiCQl1iFlw.png)
<span class="figcaption_hack">neighbour1.c.gcov</span>

Owkay..time for repentance. Now it’s time to employ `gdb` . Did you notice that
the user opted to spare the life of his fellow neighbour.

> Can’t he be let go once? A second chance? Why so cruel?

Suppose the user has the evil intention to always kidnap or kill or send
corrupted data. So…can you check on the input data and change it while it gets
executed? Of course input data is received, there shouldn’t be any way you can
change values of variables while they’re still inside your process memory?
However `gdb` can do it for you! Here’s how:

<span class="figcaption_hack">code injection with gdb to change value of variables</span>
[Demo on youtube.com](https://youtu.be/sUqmS0sUaFo)

* Invoke debugging using `gdb ./neighbour2` . Now we create 2 *stops* in the
program where we can examine the value of the variables. Create breakpoints at
the declaration and at the calling of `find()` .
* Use command `list` or `l` to view the line numbers and `break <line number>` or
`b <line number>`to set the breakpoints.
* Now use `run` or `r` to start execution inside the debugger. The process will ask
for an input as usual, enter a choice(This is the value we will attempt in
changing).
* When it reaches it’s 1st breakpoint, examine all the local variables using `info
locals` . After that, enter `continue` to reach the next breakpoint.
```
    Breakpoint 2, main (argc=1, argv=0x7fffffffddc8)
        at neighbour2.c:67
    67                      i=find(randv, randt);
    (gdb)info locals
    pid = 8623
    keygen = 1929685536
    shmid = 20774943
    shmptr = 0x7ffff7ff6000
    i = 21845
    randt = 2
    randv = 0x555555757260
    (gdb)continue
    Continuing.
```

* At the next breakpoint(which will be at the defination of `find()`, we examine
the values again to ensure the input value(which is key=2 in our case)has been
passed correctly. As the variables here are not local, we use `info args` :
```
    Breakpoint 1, find (tree=0x555555757260, key=2)
        at neighbour2.c:33
    33          if (! tree)
    (gdb) info args
    tree = 0x555555757260
    key = 2
```

> Cool. So… neighbour1 is about to get killed. Can we save him?

* We now attempt in changing the value of key. Follow:
```
    (gdb) compile code key=3;
    (gdb) continue
    Continuing.

    Breakpoint 1, find (tree=0x5555557572c0, key=3)
        at neighbour2.c:33
    33          if (! tree)
    (gdb) info args
    tree = 0x5555557572c0
    key = 3
    (gdb) continue
    Continuing.
```

Welps! Using `compile code` we were successful to change the value of the input
data. Guess who just got saved?

    Sent SIGUSR2 signal to neighbour. Neighbour 8623 is spared

So there you go! Today we learnt how to analyze inter-process communication(and
even change the messages) with the help of **The 3G**. Legends say that 3G is
always around you. They're just a few commands away. Give them a call whenever
you need ❤.<br> If you’re interested in further reading, these are some nice
starting points:

<br> 
[The Heisenberg Debugging Technology](https://sourceware.org/gdb/talks/esc-west-1999/)<br>
[The GNU C library](https://www.gnu.org/software/libc/manual/html_node/Introduction.html#Introduction)
