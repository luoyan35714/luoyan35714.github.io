---
layout: post
title:  Linux串口相关
date:   2016-03-03 14:20:00 +0800
categories: 技术文档
tag: Linux
---

* content
{:toc}


Linux串口相关
==============================

* 查看串口名称使用

{% highlight bash %}
[root@localhost bin]# ls -l /dev/ttyS*
{% endhighlight %}

* 查看串口设备

{% highlight bash %}
[root@localhost bin]# dmesg | grep ttyS*
{% endhighlight %}

* 设置或显示串口的相关信息

{% highlight bash %}
[root@localhost bin]# setserial -g /dev/ttyS[01234]
{% endhighlight %}

* Linux 打开默认串口支持数量超过4个的方法

> Linux下默认只开启了4个串口，当使用多串口主板的时候需要修改配置支持其他的串口：

{% highlight bash %}
##确认一下编译参数
[root@localhost bin]# cat /boot/config-`uname -r` | grep 8250
[root@localhost bin]# vi /boot/grub/grub.conf 或者 vi /etc/grub.conf 
##在kernel在末尾加空格，还有加上下面几个字8250.nr_uarts=16 
##这段参数里的 16 是指打开16个串口，但不一定能和实际硬件对的上的， 请重新启动 Linux ，查看 /dev 目录下面， 数一下 ttyS×× 的数量
{% endhighlight %}


<br />
<br />

参考资料：
===========================

linux支持串口(serial)登录配置方法：[http://www.cnblogs.com/zhuhongbao/archive/2011/05/26/2059206.html](http://www.cnblogs.com/zhuhongbao/archive/2011/05/26/2059206.html)

Linux 打开默认串口支持数量超过4个的方法: [http://blog.csdn.net/sidely/article/details/41959685](http://blog.csdn.net/sidely/article/details/41959685)

如何查看linux下串口是否可用?串口名称等?: [http://zhidao.baidu.com/link?url=h4_MrdEUGzZhnHMTMUcd1ft0Fft0h7NYaZsH6C9NhFCVZKeJD6UVxnw50a9outW6oYKyRh_OP-YsQyJu03_Wlq](http://zhidao.baidu.com/link?url=h4_MrdEUGzZhnHMTMUcd1ft0Fft0h7NYaZsH6C9NhFCVZKeJD6UVxnw50a9outW6oYKyRh_OP-YsQyJu03_Wlq)

Linux setserial命令 : [http://www.runoob.com/linux/linux-comm-setserial.html](http://www.runoob.com/linux/linux-comm-setserial.html)
<br />
<br />