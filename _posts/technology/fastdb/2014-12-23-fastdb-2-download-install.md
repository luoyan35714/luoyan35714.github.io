---
layout: post
title:  fastdb-学习笔记(二)-下载和安装
date:   2014-12-23 17:00:01 +0800
category : 技术文档
tag : fastdb
---

* content
{:toc}


下载
=================================

- FastDB官网:[http://www.garret.ru/fastdb.html](http://www.garret.ru/fastdb.html)
- FastDB Windows安装文件下载[http://www.garret.ru/fastdb-376.zip](http://www.garret.ru/fastdb-376.zip)
- FastDB Linux安装文件下载[http://www.garret.ru/fastdb-3.76.tar.gz](http://www.garret.ru/fastdb-3.76.tar.gz)

安装
=================================

Windows下安装
=================================

- 复制解压目录下的以下两个jar包到项目BuildPath
{% highlight text %}
javacli.jar
jnicli.jar
{% endhighlight %}

![windows copy jar](/images/blog/fastdb/2-download-install/1_windows_copy_jar.png)

- 复制`jnicli`路径下的`jnicli.dll`到项目根目录下。

![windows paste jar](/images/blog/fastdb/2-download-install/2_windows_paste_jar.png)

Linux下安装
=================================

{% highlight C %}
##安装gcc-c++
##CentOS 6.4 64位 minimal安装，
$ yum install gcc make gcc-c++
##下载安装包
$ wget http://www.garret.ru/fastdb-3.76.tar.gz
##解压安装包
$ tar -xvf fastdb-3.76.tar.gz
##切到安装目录
$ cd fastdb
##配置文件初始化
$ ./configure --prefix=/opt/fastdb
##Make安装
$ make -j16
$ make install
{% endhighlight %}

查看/usr/local/lib目录下是否存在下述文件验证是否安装成功

![Linux install success](/images/blog/fastdb/2-download-install/3_linux_install_success.png)

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