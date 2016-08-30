---
layout: post
title:  fastdb-学习笔记(一)-介绍
date:   2014-12-23 16:32:01 +0800
category : 技术文档
tag : fastdb
---

* content
{:toc}


翻译自[FastDB Main Memory Database Management System](http://www.garret.ru/fastdb/FastDB.htm#introduction)


- FastDB 是一个高效率的内存数据库系统，具有实时性能和方便的 C++ 接口。

- FastDB 并不支持客户端/服务器结构，所有使用FastDB 数据库的应用程序都必须运行在同一台主机上。

- FastDB 为具有主导读取访问模式的应用程序作了优化。通过消除数据传输的开销和使用高性能的锁工具实现了查询执行的高速度。数据库文件和使用该数据库的每一个应用程序占用的虚拟内存空间相映射。因此查询在应用的上下文中执行而不需要切换上下文以及数据传输。

- 在FastDB 中，通过原子指令来实现对数据库并发访问的同步，几乎不增加查询的开销。

- FastDB 假设整个数据库都在RAM中，并且依据这个假定优化了查询算法和结构。

- 另外，fastdb没有数据库缓冲管理开销，不需要在数据库文件和缓冲池之间传输数据。这就是fastdb运行速度明显快于把数据放在缓冲池中的传统数据库的原因。

- FastDB 支持事务、在线备份和系统崩溃之后的自动恢复。
	* 事务提交协议基于一个影子根页算法，对数据库执行原子更新操作。
	* 恢复操作执行起来非常快，给关键应用程序提供了高效率。
	* 取消事务日志改进了整个系统的性能，并且使得可以更有效的利用系统资源。


- <p>FastDB 是面向应用的数据库，数据库表通过应用程序的类信息来构造。</p>

- fastdb支持自动的模式评估，使你可以只需要在一个地方更改-你的应用程序的类。

- FastDB 为从数据库中提取数据提供了一个灵活而方便的接口。查询语言FastDB 支持一种语法和SQL 非常类似的查询语言。通过一些后关系特性如非原子字段，嵌套数组，用户定义类型和方法，对象间直接引用简化了数据库应用程序的设计并使之更有效率。

- 尽管fastdb的优化是立足于假定整个数据库配置在计算机的物理内存中，但是也有可能出现使用的数据库的大小超过了系统物理内存的大小的情况，在这种情况下标准的操作系统交换机制就会工作。但是整个fastdb的搜索算法和结构是建立在假定所有的数据都存在于内存中的，因此数据换出的效率不会很高。

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