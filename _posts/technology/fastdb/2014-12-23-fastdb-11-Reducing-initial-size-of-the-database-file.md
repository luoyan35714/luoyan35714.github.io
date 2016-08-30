---
layout: post
title:  fastdb-学习笔记(十一)-减少database文件初始化大小
date:   2014-12-24 13:19:01 +0800
category : 技术文档
tag : fastdb
---

* content
{:toc}


By default the initial size of empty database file is 4 megabyte. For some application it is desirable to reduce initial size of the database. You can increase or decrease the initial database size by changing dbDefaultInitDatabaseSize parameter. Reducing the initial database size can only cause only additional database reallocations when the database is growing. Reallocation is expensive operation (it requires unmapping the file and mapping it to the new location, as a result the modified pages are first saved to the disk, and then has to be reloaded from the disk), so reducing number of reallocations is significant. FastDB duplicates the virtual memory size used by the database during reallocation.

By changing dbDefaultInitDatabaseSize you could not make database file to become smaller than 1Mb. This is because of another parameter - dbDefaultInitIndexSize, which specify size of object index. Default value is 64k, each entry is 4 bytes long and there two instances of the index - primary and shadow. So only the index occupies 512k of memory. Another 512k is reserved for storing data. So the initial size of the database can be reduced by decreasing dbDefaultInitIndexSize parameter. But I do not recommend to do it, because it is unlikely that there will be less than several thousands objects in the database.

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