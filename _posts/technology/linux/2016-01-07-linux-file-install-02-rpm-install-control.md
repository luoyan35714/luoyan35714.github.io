---
layout: post
title:  Linux环境下的文件安装之(二) - RPM命令管理
date:   2016-01-07 23:31:00 +0800
categories: 技术文档
tag: Linux
---

RPM命令管理
==============================

RPM包命名原则
------------------------------

> httpd-2.2.15-15.el6.centos.1.i686.rpm <br>
> - httpd软件包名 <br>
> - 2.2.15软件版本 <br>
> - 15软件发布的次数 <br>
> - el6.centos适合的linux平台,可能为rhel6代表Redhat6 <br>
> - i686适合的硬件平台，可能i386,x86_64,x64等 <br>
> - rpm rpm包扩展名

RPM包依赖
------------------------------

+ 树形依赖：a->b->c
+ 环形依赖：a->b->c->a
+ 模块依赖：查询网站[http://www.rpmfind.net/](http://www.rpmfind.net/)

包全名和包名
------------------------------

+ 包全名：操作的包是没有安装的软件包时，使用包全名，而且要注意路径
+ 包名：操作已经安装的软件包时，使用包名，是搜索/var/lib/rpm中的数据库

RPM安装
------------------------------

{% highlight bash %}
[root@localhost ~]# rpm -ivh h
> 选项：
> -i(install) 安装
> -v(verbose) 显示详细信息
> -h(hash) 显示进度
> --nodeps 不检测依赖性
{% endhighlight %}

升级
------------------------------

{% highlight bash %}
[root@localhost ~]# rpm -Uvh 包全名
> 选项
> -U(upgrade) 升级
{% endhighlight %}

卸载
------------------------------

{% highlight bash %}
[root@localhost ~]# rpm -e 包名
> 选项
> -e(erase) 卸载
> --nodeps不检查依赖性
{% endhighlight %}

RPM包查询
------------------------------


RPM包校验
------------------------------


<br />
<br />

参考资料：
-------------------------------------

慕课网-Linux软件安装管理：[http://www.imooc.com/learn/447](http://www.imooc.com/learn/447)

鸟哥的Linux私房菜: [http://linux.vbird.org/linux_server/0440ntp.php](http://linux.vbird.org/linux_server/0440ntp.php)

<br />
<br />