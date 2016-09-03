---
layout: post
title:  Hadoop 学习笔记之(十一) - Hadoop小文件优化
date:   2015-05-15 10:10:00 +0800
categories: 技术文档
tag: Hadoop
---

* content
{:toc}


Hadoop Archive
---------------------------

是一个高效地将小文件放入HDFS块中的文件存档工具，它能够将多个小文件打包成一个HAR文件，这样可以namenode内存使用
{% highlight bash %}
hadoop archive -archiveName test.har -p /foo/bar /user/zoo/bar
{% endhighlight %}
查看命令
{% highlight bash %}
hadoop dfs -ls har:///user/zoo/bar/test.har
{% endhighlight %}

Sequence File
---------------------------

Sequence file由一系列的二进制key/value组成，如果key为小文件名，value为文件内容，可以将大批小文件合并成一个大文件
在InputFormat和OutputFormat中设置

CombineFileInputFormat
---------------------------

CombineFileInputFormat是一种新的inputformat,用于将多个文件合并成一个单独的split，另外，它会考虑数据的存储位置

开启JVM重用
---------------------------

Hadoop中有个参数是mapred.job.reuse.jvm.num.tasks，默认是1，表示一个JVM上最多可以顺序执行的task数目（属于同一个Job）是1。也就是说一个task启一个JVM。

> 注意：
<br />
> JVM重用技术不是指同一Job的两个或两个以上的task可以同时运行于同一JVM上，而是排队按顺序执行。

Mapred.reduce.parallel.copies
---------------------------

复制Map输出的线程数, 默认值是5, 可以根据业务合理设置大一些，以面对大批小文件的处理。

<br />
<br />

参考资料
=======================

Hadoop官方文档 : [http://hadoop.apache.org/docs/r1.0.4/cn/quickstart.html](http://hadoop.apache.org/docs/r1.0.4/cn/quickstart.html)
<br />

陆嘉恒 : 《Hadoop实战》 第2版

<br />
<br />