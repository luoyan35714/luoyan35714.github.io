---
layout: post
title:  Linux环境下的文件安装之(二) - RPM命令管理
date:   2016-01-07 23:31:00 +0800
categories: 技术文档
tag: Linux
---

* content
{:toc}


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
{% highlight bash %}
[root@localhost ~]# rpm -q 包名
# 查询包是否安装
> -q 查询(query)

[root@localhost ~]# rpm -qa
# 查询所有已经安装的RPM包
> -a 所有(all)

[root@localhost ~]# rpm -qi 包名
# 查询软件包详细信息
> -i 查询软件信息(information)
> -p 查询未安装包信息(package)

[root@localhost ~]# rpm -ql 包名
# 查询包中文件安装位置
> -l 列表(list)
> -p 查询未安装包信息(package)

[root@localhost ~]# rpm -qf 系统文件名
# 查询系统文件属于哪个RPM包
> -f 查询系统文件属于哪个软件包(file)

[root@localhost ~]# rpm -qR 包名
# 查询软件包的依赖性
> -R 查询软件包的依赖性(requires)
> -p 查询未安装包信息(package)

{% endhighlight %}

+ RPM包默认安装位置

|	路径			|释义						|
|	/etc/			|配置文件安装目录			|
|	/usr/bin/		|可执行的命令安装目录		|
|	/usr/lib/		|程序所使用的函数库保存位置	|
|	/usr/share/doc/	|基本的软件使用手册保存位置	|
|	/usr/share/man/	|帮助文件保存位置			|

RPM包校验
------------------------------

{% highlight bash %}
[root@localhost ~]# rpm -V 已安装的包名
# RPM包校验
> 选项
> -V 校验指定RPM包中的文件(verify)

S.5....T.  c /etc/httpd/conf/httpd/conf

{% endhighlight %}

+ 验证内容中的8个信息的具体内容如下：

|	S |文件大小是否改变									|
|	M |文件的类型或文件的权限(rwx)是否被改变			|
|	5 |文件MD5校验和是否改变(可以看成文件内容是否改变)	|
|	D |设备的主从代码是否改变 							|
|	L |文件路径是否改变   								|
|	U |文件的属主(所有者)是否改变 						|
|	G |文件的属组是否改变 								|
|	T |文件的修改时间是否改变							|

+ 验证的文件类型

| c | 配置文件(config file) 										|
| d | 普通文件(documentation) 										|
| g | 鬼文件(ghost file), 很少见，就是该文件不应该被这个RPM包包含 	|
| L | 授权文件(license file) 										|
| r | 描述文件(read me) 											|


RPM包中文件提取
------------------------------

{% highlight bash %}
[root@localhost ~]# rpm2cpio 包全名 | cpio -idv .文件绝对路径
> -rpm2cpio 将rpm包转换为cpio格式的命令
> -cpio 是一个标准工具，它用于创建软件档案文件和从档案文件中提取文件
{% endhighlight %}

+ cpio
{% highlight bash %}
[root@localhost ~]# cpio 选项 < [文件|设备]
> 选项
> -i:copy-in模式，还原
> -d:还原时自动新建目录
> -v:显示还原过程
{% endhighlight %}


<br />
<br />

参考资料
===========================

慕课网-Linux软件安装管理：[http://www.imooc.com/learn/447](http://www.imooc.com/learn/447)

鸟哥的Linux私房菜: [http://linux.vbird.org/linux_server/0440ntp.php](http://linux.vbird.org/linux_server/0440ntp.php)

<br />
<br />