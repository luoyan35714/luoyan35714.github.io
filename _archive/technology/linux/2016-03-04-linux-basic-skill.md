---
layout: post
title:  Linux 常用功能和快捷键记录
date:   2016-03-04 10:40:00 +0800
categories: 技术文档
tag: Linux
---

* content
{:toc}


Linux 常用功能和快捷键记录
==============================

* 后台启动某服务并且把输出信息导出到nohup.out文件

{% highlight bash %}
[root@localhost bin]# nohup ./service.sh &
{% endhighlight %}

* vi快捷键

{% highlight bash %}
h 上一个字符
l 下一个字符
j 下一行
k 上一行
r 替换字符
G 文档末尾

u 撤销

q 退出
w 保存
！强制
{% endhighlight %}

* 持续查看某日志文件

{% highlight bash %}
[root@localhost bin]# tailf 文件名
[root@localhost bin]# tail -f 文件名
{% endhighlight %}

* 查看进程运行情况

{% highlight bash %}
[root@localhost bin]# ps ax | grep '关键字'
[root@localhost bin]# ps -ef | grep '关键字'
{% endhighlight %}

* 查看CPU和内存使用情况

{% highlight bash %}
[root@localhost bin]# top
#在top状态下按1，可以查看CPU每个核的使用情况
{% endhighlight %}

<br />
<br />
 