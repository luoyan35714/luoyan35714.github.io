---
layout: post
title:  fastdb-学习笔记(六)-延迟事务和在线备份调度
date:   2014-12-24 13:00:01 +0800
category : 技术文档
tag : fastdb
---

* content
{:toc}


翻译自[FastDB Main Memory Database Management System](http://www.garret.ru/fastdb/FastDB.htm#sql)

转自[CSDN Blog](http://blog.csdn.net/fuyun10036/article/details/8620542)

Fastdb支持ACID事务。也就是说当数据库得到事务已经提交的报告后，可以保证该数据库在系统出错时（除了硬盘上的数据库镜像损坏外）能够恢复。在标准配置（例如没有非易变RAM）和通用操作系统中（windows，unix….）提供这种特性的唯一方法是对硬盘进行同步写。在这里“同步”意味着操作系统直到数据被真正写到硬盘上之后才会把控制权交回应用程序。不幸的是同步写是非常耗时的操作—平均磁盘访问时间是10ms，因此每秒很难达到处理100个事务的性能。

但是在很多情况下，丢失最后几秒的变化是可以接受的（但是要与数据库保持一致性）。依照这个假定，数据库性能可以显著得到提高，fastdb为这样的应用程序提供了“延迟事务提交模式”。当提交事务延迟非零时，数据库并不马上执行提交操作，而是根据一个指定的超时时间延迟操作。当超时时间过期，事务正常提交，这保证了在系统崩溃时只有在指定的超时时间内的变化才被丢失。

如果以延迟事务初始化的线程在被延迟的事务提交之前启动了新的事务，则延迟提交操作被忽略。因此fastdb可以把一个客户端执行的许多继起(subsequent)的事务组成一个单一的大事务。这样就极大地提高了性能，因为其减少了同步写的次数和创建的映像页的个数。(参看事务一节)。

如果其他客户端试图在延迟提交超时时间过期前启动事务，则fastdb强制进行延迟提交然后释放资源。因此同步不受延迟提交的影响。

延迟提交缺省是关闭的（超时时间为0）。你可以指定提交延迟参数作为dbDatabase::open方法的第二个可选参数。在SubSQL工具中也可以通过设置FASTDB_COMMIT_DELAY环境变量（秒）来指定事务提交延迟的值。

fastdb使用的事务提交模式保证了在软硬件出现故障时只要磁盘上的数据库没有损坏（写到盘上的数据可以正确的读出来）的恢复。如果由于某些原因数据库文件损坏了，则恢复的唯一途径是使用备份（但愿在不久之前做过这样的操作）。

当数据库离线是可以通过拷贝数据库文件来备份。dbDatabase类提供了backup方法来进行在线备份而不需要停止数据库。程序员在任何时候都可以调用这个方法。不过更进一步，fastdb提供了备份调度可以自动进行备份。唯一需要的是—备份文件名和备份之间的时间间隔。

dbDatabase::scheduleBackup(char const* fileName,time_t period)方法派生出单独的线程在指定的时间内（秒）向指定的位置进行备份。如果filename以"?"字符结尾，则备份初始化的时间被附加到文件名的末尾来产生唯一的文件名。在这种情况下所有的备份文件保存在磁盘上（把太老的备份文件移除或者把它们移到别的介质上是管理员的责任）。否则备份被写入到以fileName+".new"命名的文件中，备份完成后旧备份文件被删除新文件被重命名为fileName.在后一种情况下，fastdb也将检查旧备份文件（如果有的话）的创建日期然后按照这样的方式来调整等待时间，就是备份之间的时间差要等于指定的间隔（因此如果数据库服务器每天只启动8个小时，而备份间隔为24小时，则备份将每天都进行，这与唯一文件名模式不同）。

可以通过设置FASTDB_BACKUP_NAME环境变量在SubSQL工具中进行备份调度。如果指定了FASTDB_BACKUP_NAME则间隔值依此取定，否则设置为每天。从备份中恢复只需要用一些备份文件替代损坏的数据库文件。

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