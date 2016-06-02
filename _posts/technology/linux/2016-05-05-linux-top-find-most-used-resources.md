---
layout: post
title:  Linux Top 命令找出Java进程中线程资源占用情况
date:   2016-05-05 10:01:00 +0800
categories: 技术文档
tag: Linux
---

Linux Top 命令找出Java进程中线程资源占用情况
==============================

* 先用top命令找出占用资源厉害的java进程id，如：如java的进程id为'8343'，接下来用top命令单独对这个进程中的所有线程作监视：

{% highlight bash %}
[root@localhost bin]# top -p 8343 -H
{% endhighlight %}

![找出Java进程内部线程的资源占用情况](/images/blog/linux/05-top-find-most-used-resources/01-top_to_find_java_processes.png)

* 如上图所示，linux下，所有的java内部线程，其实都对应了一个进程id，也就是说，linux上的sun jvm将java程序中的线程映射为了操作系统进程；我们看到，占用CPU资源最高的那个进程id是'5875'，这个进程id对应java线程信息中 的'nid'('n' stands for 'native');

* 要想找到到底是哪段具体的代码占用了如此多的资源，先使用jstack打出当前栈信息到一个文件里, 比如stack.log：

{% highlight bash %}
[root@localhost bin]# jstack 8343 > stack.log
{% endhighlight %}

* 然后使用'jtgrep'脚本把这个进程号为'5875'的java线程在stack.log中抓出来：

{% highlight bash %}
[root@localhost bin]# jtgrep 5875 stack.log
{% endhighlight %}

* 其中，'jtgrep'是自己随便写的一个shell脚本：

{% highlight bash %}
#!/bin/sh
 
nid=`python -c "print hex($1)"`
grep -i $nid $2
{% endhighlight %}

* 道理很简单，就是把'5875'转换成16进制后，直接grep stack.log;可以看到，被grep出的那个线程的nid=0x16f3，正好是5875的16进制表示。

<br />
 
参考资料
--------------------------------------------------------

java:linux上找出最耗资源的线程方法 : [http://blog.163.com/wf_shunqiziran/blog/static/176307209201252901951722/](http://blog.163.com/wf_shunqiziran/blog/static/176307209201252901951722/)

<br />
<br />