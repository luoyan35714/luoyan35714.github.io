---
layout: post
title:  fastdb-学习笔记(十二)-配置无磁盘模式
date:   2014-12-24 13:20:01 +0800
category : 技术文档
tag : fastdb
---

* content
{:toc}


Some application needs only query engine and do not need to store data to the disk (for example, applications for mobile devices). FastDB provides diskless configuration. It is switched on by rebuilding FastDB with DISKLESS_CONFIGURATION option set in makefile. In this case FastDB will not write any data to the disk. When application is started database is always empty. Other application can be connected to the same database, concurrently accessing the same data. Database exists until there is some application using it. When last application closes database, memory mapped object is destructed and all data is lost.
It is important to notice that unlike normal mode, FastDB is not able to extend database in diskless mode. To be able to reallocate memory mapped object (to extend its size), FastDB will have to create somewhere (in memory) temporary buffer to hold all database data, copy all data to this buffer, destruct original memory mapping object, create new memory mapping object, copy data from buffer to the new memory mapping object and then destruct the buffer. So if database size was N, then reallocation requires 3*N free memory and copying of all database data two times. I think this is too large memory and CPU overhead.

So in diskless mode it is necessary to specify maximal database size in the constructor of dbDatabase (dbInitSize parameter). Specifying large size will not cause some significant system overhead, because physical pages will be in any case allocated on demand. So it is not so difficult to avoid exhaustion of database size by specifying very large value in dbInitSize parameter). The only restriction is that specified size should not be greater than size of virtual memory in the system (usually size of swap + physical memory).

In addition to DISKLESS_CONFIGURATION switch, FastDB also provides additional switches to control used OS API: USE_POSIX_MMAP, USE_POSIX_SEMAPHORES, NO_MMAP. Use them only if mechanism used by FastDB by default doesn't work (or work inefficiently at your system. Some of these switches and enables implicitly once you have choose particular configuration. The following table summarize usage of these switches:


| Set macrors | Implies | Data file | Monitor | Description |
| USE_POSIX_MMAP=0 | NO_MMAP=1 | shmat | shmat | normal access to database without mmap |
| USE_POSIX_MMAP=1 | | mmap | mmap | private process database |
| NO_MMAP | | malloc | shmat | normal access |
| DISKLESS_CONFIGURATION | USE_POSIX_MMAP=0 | shmat | shmat | transient public database |
| DISKLESS_CONFIGURATION<br>USE_POSIX_MMAP=1 | | mmap | mmap | transient private database |

<br>
<br>

参考资料
=================================

fastdb主页 : [http://www.garret.ru/fastdb.html](http://www.garret.ru/fastdb.html)

FastDB SourceForge主页 : [http://sourceforge.net/projects/fastdb](http://sourceforge.net/projects/fastdb)

FastDB SourceForge下载 :

[http://sourceforge.net/projects/fastdb/files/latest/download](http://sourceforge.net/projects/fastdb/files/latest/download)

参考博客 ：

[http://blog.csdn.net/fuyun10036/article/details/8620542](http://blog.csdn.net/fuyun10036/article/details/8620542)